/**
 * Cursor Swarm
 *
 * A single, global flock of agent arrows that lives in viewport coordinates.
 *
 *  - LIFECYCLE: the swarm starts EMPTY. An agent joins it only after it has built something.
 *    At page load, cursors fly in from the viewport edges and build the hero; when each
 *    finishes it flies to the visitor's mouse and joins the cluster. On every later view
 *    change the SAME cursors leave the mouse and build what is now in view; extra cursors
 *    are only brought in when a view has more things to build than the swarm has agents.
 *  - HOME STATE: every agent that has joined hovers in a loose cluster around the visitor's
 *    mouse (or around the last touch / a default point if the mouse never moved).
 *    If the mouse is still or has left the window, the cluster flies to the last
 *    known position and stays there, completely still.
 *  - DISPATCH: when a build timeline starts, one swarm agent (or a brand-new one if none is
 *    free) leaves and the section-level cursor (which the existing build animation drives,
 *    unchanged) takes over at the exact same on-screen position.
 *  - HAND BACK: when the build finishes (or is interrupted) the swarm agent re-appears
 *    where the section cursor was and flies back to the cluster along a curved path,
 *    with a speed-dependent motion trail. Agents therefore rejoin one by one, in the
 *    order their builds finish.
 *
 * Everything per-frame is plain DOM transforms driven by one gsap ticker callback —
 * no React state is touched while animating.
 */
import gsap from 'gsap';
import { getMousePos } from './mouseTracker';
import type { AgentPersona } from './types';

interface Point {
  x: number;
  y: number;
}

/** unspawned = has never built anything yet: hidden and not part of the swarm */
type AgentState = 'unspawned' | 'idle' | 'flying' | 'away';

interface Flight {
  t0: number; // seconds (performance.now()/1000)
  dur: number;
  sx: number;
  sy: number;
  cx: number;
  cy: number;
  bank: number;
}

interface SwarmAgent {
  index: number;
  persona: AgentPersona;
  el: HTMLElement | null;
  ghosts: HTMLElement[];
  // current + previous position in viewport px (the arrow tip)
  x: number;
  y: number;
  px: number;
  py: number;
  rot: number;
  state: AgentState;
  lag: number; // per-agent follow easing (0..1 per 60fps frame)
  slot: { dx: number; dy: number };
  fly: Flight | null;
  placed: boolean;
  // trail history ring buffer (x,y pairs)
  hist: number[];
  head: number;
  // last values written to the DOM (skip redundant writes)
  wx: number;
  wy: number;
  wr: number;
  shown: boolean;
  ghostOp: number[];
}

interface AwayRecord {
  agent: SwarmAgent | null;
  cursorEl: HTMLElement | null;
  containerEl: HTMLElement | null;
  lastX: number;
  lastY: number;
}

const HIST = 10;
const GHOST_LAG = [2, 4, 6]; // frames behind the arrow
const GHOST_ALPHA = [0.5, 0.3, 0.16];

const easeOut = gsap.parseEase('power3.out');

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

/**
 * Stable, well-spread offset around the pointer for agent `index`.
 * The sector right/below the pointer is left free for the visitor's own name pill.
 */
function computeSlot(index: number): { dx: number; dy: number } {
  const golden = (index * 0.61803398875) % 1;
  const startDeg = 75;
  const spanDeg = 270;
  const angle = ((startDeg + spanDeg * golden) * Math.PI) / 180;
  const radius = 26 + (index % 3) * 14 + ((index * 7) % 5) * 3;
  return { dx: Math.cos(angle) * radius, dy: Math.sin(angle) * radius };
}

class SwarmManager {
  private agents: SwarmAgent[] = [];
  private away = new Map<object, AwayRecord>();
  private reduced = false;
  private tickerOn = false;

  /* ------------------------------------------------------------------ setup */

  public setAgents(personas: AgentPersona[]) {
    const mouse = getMousePos();

    // Drop agents that no longer exist (pool shrank). Anyone still away loses its swarm link.
    if (this.agents.length > personas.length) {
      const removed = this.agents.splice(personas.length);
      removed.forEach((a) => {
        this.away.forEach((rec) => {
          if (rec.agent === a) rec.agent = null;
        });
      });
    }

    personas.forEach((persona, index) => {
      const existing = this.agents[index];
      if (existing) {
        existing.persona = persona;
        existing.slot = computeSlot(index);
        return;
      }
      const slot = computeSlot(index);
      const x = mouse.clientX + slot.dx;
      const y = mouse.clientY + slot.dy;
      this.agents[index] = {
        index,
        persona,
        el: null,
        ghosts: [],
        x,
        y,
        px: x,
        py: y,
        rot: 0,
        state: 'unspawned',
        lag: 0.07 + ((index * 5) % 7) * 0.014,
        slot,
        fly: null,
        placed: false,
        hist: new Array(HIST * 2).fill(0),
        head: 0,
        wx: NaN,
        wy: NaN,
        wr: NaN,
        shown: false,
        ghostOp: [-1, -1, -1],
      };
      this.resetHistory(this.agents[index]);
    });
  }

  public register(index: number, el: HTMLElement | null, ghosts: HTMLElement[]) {
    const a = this.agents[index];
    if (!a || !el) return;
    a.el = el;
    a.ghosts = ghosts;
    a.wx = NaN;
    a.wy = NaN;
    a.wr = NaN;
    a.shown = false;
    a.ghostOp = [-1, -1, -1];
    this.writeDom(a, 0);
    this.ensureTicker();
  }

  public unregister(index: number) {
    const a = this.agents[index];
    if (!a) return;
    a.el = null;
    a.ghosts = [];
    if (!this.agents.some((x) => x.el)) this.stopTicker();
  }

  public setReducedMotion(reduced: boolean) {
    this.reduced = reduced;
  }

  /* --------------------------------------------------------------- dispatch */

  /**
   * An agent leaves the swarm to build something.
   * Returns the start point (in `containerEl` coordinates) for the section-level cursor,
   * which is exactly where the swarm agent is on screen right now.
   */
  public dispatch(
    owner: object,
    cursorEl: HTMLElement | null,
    containerEl: HTMLElement,
    preferredIndex: number
  ): Point {
    // A restarted timeline that never handed back: return the old agent first.
    if (this.away.has(owner)) this.handBack(owner);

    const rect = containerEl.getBoundingClientRect();
    const agent = this.pickAgent(preferredIndex);

    if (!agent) {
      // Swarm exhausted: build anyway, starting from the mouse. No swarm link to return to.
      const m = getMousePos();
      this.away.set(owner, {
        agent: null,
        cursorEl,
        containerEl,
        lastX: m.clientX,
        lastY: m.clientY,
      });
      return { x: m.clientX - rect.left, y: m.clientY - rect.top };
    }

    if (agent.state === 'unspawned') {
      // First job for this cursor: it flies in from a viewport edge (not from the mouse)
      const sp = this.spawnPoint();
      agent.x = agent.px = sp.x;
      agent.y = agent.py = sp.y;
      agent.placed = true;
      this.resetHistory(agent);
    }

    const vx = agent.x;
    const vy = agent.y;

    agent.state = 'away';
    agent.fly = null;
    this.away.set(owner, { agent, cursorEl, containerEl, lastX: vx, lastY: vy });
    this.writeDom(agent, 1);

    if (cursorEl) this.applyPersona(cursorEl, agent.persona);

    return { x: vx - rect.left, y: vy - rect.top };
  }

  /**
   * The section-level cursor is done (or was interrupted): the swarm agent re-appears at the
   * cursor's current on-screen position and flies back to the cluster.
   */
  public handBack(owner: object) {
    const rec = this.away.get(owner);
    if (!rec) return;
    this.away.delete(owner);

    const { agent, cursorEl, containerEl } = rec;

    let vx = rec.lastX;
    let vy = rec.lastY;
    if (cursorEl && containerEl && cursorEl.isConnected && containerEl.isConnected) {
      const rect = containerEl.getBoundingClientRect();
      const cx = Number(gsap.getProperty(cursorEl, 'x'));
      const cy = Number(gsap.getProperty(cursorEl, 'y'));
      if (Number.isFinite(cx) && Number.isFinite(cy)) {
        vx = rect.left + cx;
        vy = rect.top + cy;
      }
    }

    if (cursorEl) {
      gsap.killTweensOf(cursorEl);
      gsap.set(cursorEl, { autoAlpha: 0, rotation: 0 });
    }

    if (!agent) return;

    // Keep the entry point within reach of the viewport so the return is always visible & quick
    const margin = 140;
    vx = clamp(vx, -margin, window.innerWidth + margin);
    vy = clamp(vy, -margin, window.innerHeight + margin);

    agent.x = agent.px = vx;
    agent.y = agent.py = vy;
    this.resetHistory(agent);

    if (this.reduced) {
      agent.state = 'idle';
      agent.fly = null;
    } else {
      this.startFlight(agent, vx, vy);
    }
    this.writeDom(agent, 0);
  }

  /** Hand back several owners at once (section unmount / replay). */
  public handBackAll(owners: object[]) {
    owners.forEach((o) => this.handBack(o));
  }

  /**
   * Hand back every agent that is currently away using one of these section-level cursor
   * elements. Used when a section unmounts or replays so nothing is left stranded.
   */
  public handBackByCursorEls(els: Array<HTMLElement | null | undefined>) {
    const set = new Set(els.filter(Boolean) as HTMLElement[]);
    if (set.size === 0) return;
    const owners: object[] = [];
    this.away.forEach((rec, owner) => {
      if (rec.cursorEl && set.has(rec.cursorEl)) owners.push(owner);
    });
    owners.forEach((o) => this.handBack(o));
  }

  /* ------------------------------------------------------------- debugging */

  public getDebugState() {
    const m = getMousePos();
    return this.agents.map((a) => ({
      index: a.index,
      name: a.persona.name,
      state: a.state,
      x: Math.round(a.x),
      y: Math.round(a.y),
      distToMouse: Math.round(Math.hypot(a.x - m.clientX, a.y - m.clientY)),
    }));
  }

  /* --------------------------------------------------------------- internals */

  private pickAgent(preferredIndex: number): SwarmAgent | null {
    const n = this.agents.length;
    if (n === 0) return null;
    const pref = clamp(preferredIndex, 0, n - 1);

    // 1) The same cursors that are already in the swarm get the job first: nearest to the
    //    preferred index (ring distance), preferring settled agents over ones still flying.
    // 2) Only if every swarm member is busy is a brand-new cursor brought in.
    const search = (wantSpawned: boolean) => {
      let best: SwarmAgent | null = null;
      let bestScore = Infinity;
      for (const a of this.agents) {
        if (!a.el || a.state === 'away') continue;
        if ((a.state !== 'unspawned') !== wantSpawned) continue;
        const d = Math.abs(a.index - pref);
        const ring = Math.min(d, n - d);
        const score = ring + (a.state === 'flying' ? 0.5 : 0);
        if (score < bestScore) {
          bestScore = score;
          best = a;
        }
      }
      return best;
    };
    return search(true) ?? search(false);
  }

  /** A point just outside a random edge of the viewport, where new cursors fly in from. */
  private spawnPoint(): Point {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const pad = 70;
    const r = 0.15 + Math.random() * 0.7;
    switch (Math.floor(Math.random() * 4)) {
      case 0:
        return { x: -pad, y: H * r };
      case 1:
        return { x: W + pad, y: H * r };
      case 2:
        return { x: W * r, y: -pad };
      default:
        return { x: W * r, y: H + pad };
    }
  }

  private startFlight(a: SwarmAgent, sx: number, sy: number) {
    const m = getMousePos();
    const tx = m.clientX + a.slot.dx;
    const ty = m.clientY + a.slot.dy;
    const dx = tx - sx;
    const dy = ty - sy;
    const dist = Math.hypot(dx, dy) || 1;

    const nx = -dy / dist;
    const ny = dx / dist;
    const sign = Math.random() > 0.5 ? 1 : -1;
    const mag = Math.min(40 + Math.random() * 100, dist * 0.5);

    const travelAngle = Math.atan2(dy, dx) * (180 / Math.PI);
    const bank = clamp((travelAngle - 45) * 0.25, -16, 16);

    a.fly = {
      t0: performance.now() / 1000,
      dur: clamp(0.55 + dist / 1500, 0.6, 1.15),
      sx,
      sy,
      cx: (sx + tx) / 2 + nx * sign * mag,
      cy: (sy + ty) / 2 + ny * sign * mag,
      bank,
    };
    a.state = 'flying';
  }

  private resetHistory(a: SwarmAgent) {
    for (let i = 0; i < HIST; i++) {
      a.hist[i * 2] = a.x;
      a.hist[i * 2 + 1] = a.y;
    }
    a.head = 0;
  }

  private ensureTicker() {
    if (this.tickerOn) return;
    gsap.ticker.add(this.tick);
    this.tickerOn = true;
  }

  private stopTicker() {
    if (!this.tickerOn) return;
    gsap.ticker.remove(this.tick);
    this.tickerOn = false;
  }

  private tick = (_time: number, deltaMs: number) => {
    const dt = clamp((deltaMs || 16.667) / 16.667, 0.25, 4);
    const m = getMousePos();
    const now = performance.now() / 1000;

    for (const a of this.agents) {
      if (!a.el || a.state === 'away' || a.state === 'unspawned') continue;

      const tx = m.clientX + a.slot.dx;
      const ty = m.clientY + a.slot.dy;

      a.px = a.x;
      a.py = a.y;

      if (this.reduced) {
        a.x = tx;
        a.y = ty;
        a.rot = 0;
        a.state = 'idle';
        a.fly = null;
      } else if (a.state === 'flying' && a.fly) {
        const f = a.fly;
        const p = clamp((now - f.t0) / f.dur, 0, 1);
        const e = easeOut(p);
        const inv = 1 - e;
        a.x = inv * inv * f.sx + 2 * inv * e * f.cx + e * e * tx;
        a.y = inv * inv * f.sy + 2 * inv * e * f.cy + e * e * ty;
        a.rot = f.bank * Math.sin(p * Math.PI);
        if (p >= 1) {
          a.state = 'idle';
          a.fly = null;
          a.rot = 0;
        }
      } else {
        // Settled follow: exponential ease with a per-agent lag so the flock trails as a stream.
        // Once within a fraction of a pixel it snaps and stays perfectly still.
        const k = 1 - Math.pow(1 - a.lag, dt);
        const dx = tx - a.x;
        const dy = ty - a.y;
        if (dx * dx + dy * dy < 0.04) {
          a.x = tx;
          a.y = ty;
        } else {
          a.x += dx * k;
          a.y += dy * k;
        }
        a.rot += (0 - a.rot) * k;
        if (Math.abs(a.rot) < 0.05) a.rot = 0;
      }

      // trail history
      a.head = (a.head + 1) % HIST;
      a.hist[a.head * 2] = a.x;
      a.hist[a.head * 2 + 1] = a.y;

      const speed = Math.hypot(a.x - a.px, a.y - a.py) / dt;
      this.writeDom(a, this.reduced ? 0 : clamp((speed - 2) / 12, 0, 1));
    }
  };

  private writeDom(a: SwarmAgent, trail: number) {
    const el = a.el;
    if (!el) return;

    const visible = a.state !== 'away' && a.state !== 'unspawned';
    if (visible !== a.shown) {
      el.style.visibility = visible ? 'visible' : 'hidden';
      a.shown = visible;
    }

    if (visible && (a.x !== a.wx || a.y !== a.wy || a.rot !== a.wr)) {
      el.style.transform = `translate3d(${a.x.toFixed(2)}px, ${a.y.toFixed(2)}px, 0) rotate(${a.rot.toFixed(2)}deg)`;
      a.wx = a.x;
      a.wy = a.y;
      a.wr = a.rot;
    }

    for (let k = 0; k < a.ghosts.length; k++) {
      const g = a.ghosts[k];
      if (!g) continue;
      const op = visible ? Math.round(GHOST_ALPHA[k] * trail * 100) / 100 : 0;
      if (op > 0) {
        const idx = (a.head - GHOST_LAG[k] + HIST * 4) % HIST;
        g.style.transform = `translate3d(${a.hist[idx * 2].toFixed(2)}px, ${a.hist[idx * 2 + 1].toFixed(2)}px, 0) rotate(${a.rot.toFixed(2)}deg)`;
      }
      if (op !== a.ghostOp[k]) {
        g.style.opacity = String(op);
        a.ghostOp[k] = op;
      }
    }
  }

  /** Make a section-level cursor look like the swarm agent that just left (colour + name). */
  private applyPersona(cursorEl: HTMLElement, persona: AgentPersona) {
    if (cursorEl.dataset.personaId === persona.id) return;
    const path = cursorEl.querySelector<SVGPathElement>('.cursor-paint');
    if (path) {
      path.setAttribute(cursorEl.dataset.variant === 'ibeam' ? 'stroke' : 'fill', persona.color);
    }
    const name = cursorEl.querySelector<HTMLElement>('.cursor-name');
    if (name) {
      name.textContent = persona.name;
      name.style.color = persona.color;
      name.style.borderColor = `${persona.color}55`;
    }
    cursorEl.dataset.personaId = persona.id;
  }
}

export const swarm = new SwarmManager();
