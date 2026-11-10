import React, { forwardRef, useState } from 'react';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  WHERE TO PUT YOUR PICTURE
 *
 *  1. Save your photo as   public/profile.jpg   (create the `public` folder at the
 *     project root, next to `src`, if it doesn't exist). .png / .webp also work —
 *     just change the file name below.
 *  2. Best results: portrait crop, 4:5 ratio (e.g. 800 x 1000 px), under ~300 KB.
 *  3. Until the file exists, the placeholder below is shown automatically.
 * ─────────────────────────────────────────────────────────────────────────────
 */
const PHOTO_SRC = '/profile.jpeg';
const PHOTO_ALT = 'Portrait of Kishal P';

const Handle: React.FC<{ className: string }> = ({ className }) => (
  <span className={`absolute w-2 h-2 bg-black border border-kiwi ${className}`} aria-hidden="true" />
);

/** Portrait card: centred above the headline on phones, top-right on md+ (shows a placeholder until public/profile.jpg exists). */
export const HeroPhoto = forwardRef<HTMLDivElement, { style?: React.CSSProperties }>(
  ({ style }, ref) => {
    const [failed, setFailed] = useState(false);

    return (
      <div
        ref={ref}
        style={style}
        className="relative mx-auto mb-9 w-36 md:mb-0 md:mx-0 md:absolute md:top-0 md:right-0 md:w-[200px] lg:w-[232px]"
      >
        {/* soft glow behind the frame */}
        <div
          className="absolute -inset-3 md:-inset-6 rounded-[2rem] bg-kiwi/15 blur-2xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative aspect-[4/5] rounded-xl overflow-hidden border border-kiwi/40 bg-kiwi-surface shadow-kiwi-glow">
          {!failed ? (
            <img
              src={PHOTO_SRC}
              alt={PHOTO_ALT}
              className="absolute inset-0 w-full h-full object-cover"
              onError={() => setFailed(true)}
              draggable={false}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-end">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(120% 80% at 50% 25%, #1B2410 0%, #0A0B08 70%)',
                }}
              />
              {/* silhouette */}
              <svg viewBox="0 0 200 250" className="relative w-[78%] text-kiwi/25" fill="currentColor" aria-hidden="true">
                <circle cx="100" cy="92" r="42" />
                <path d="M20 250c0-52 36-86 80-86s80 34 80 86z" />
              </svg>
              <div className="hidden md:block absolute bottom-3 inset-x-0 text-center font-mono text-[9px] uppercase tracking-widest text-kiwi/70 leading-relaxed">
                your photo here
                <div className="text-zinc-500 normal-case tracking-normal">public/profile.jpg · 4:5</div>
              </div>
            </div>
          )}

          {/* subtle kiwi tint + bottom fade so a real photo sits in the theme */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/55 via-transparent to-kiwi/5" />
        </div>

        {/* editor-style selection handles around the frame */}
        <Handle className="-top-1 -left-1" />
        <Handle className="-top-1 -right-1" />
        <Handle className="-bottom-1 -left-1" />
        <Handle className="-bottom-1 -right-1" />

        {/* name chip */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 md:left-3 md:translate-x-0 inline-flex items-center whitespace-nowrap gap-1.5 px-2.5 py-1 rounded-md bg-black/90 border border-kiwi-border text-[10px] font-mono text-zinc-200">
          <span className="w-1.5 h-1.5 rounded-full bg-kiwi" />
          Kishal P
        </div>
      </div>
    );
  }
);

HeroPhoto.displayName = 'HeroPhoto';
