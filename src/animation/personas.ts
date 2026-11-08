import { AgentPersona } from './types';

export const DEFAULT_PERSONA_POOL: AgentPersona[] = [
  { id: 'dev-kishal', name: 'Dev [Kishal]', role: 'Lead Developer', color: '#CCFF00' },
  { id: 'ui-design', name: 'UI_Design', role: 'UI & Layout', color: '#CCFF00' },
  { id: 'secops', name: 'SecOps', role: 'Security Review', color: '#FFFF00' },
  { id: 'qa-audit', name: 'QA_Audit', role: 'Code Quality', color: '#FFFF00' },
  { id: 'ai-agent', name: 'AI_Agent', role: 'Applied AI', color: '#DFFF00' },
  { id: 'kernel', name: 'Kernel', role: 'Systems & Linux', color: '#DFFF00' },
  { id: 'reviewer', name: 'Reviewer', role: 'Code Review', color: '#FFFFFF' },
  { id: 'syntax-bot', name: 'Syntax_Worker', role: 'Syntax & Typing', color: '#CCFF00' },
  { id: 'layout-bot', name: 'Layout_Worker', role: 'Components', color: '#FFFF00' },
  { id: 'rag-worker', name: 'RAG_Worker', role: 'Vector Search', color: '#DFFF00' },
  { id: 'crypto-bot', name: 'Crypto_Worker', role: 'Auth & Tokens', color: '#CCFF00' },
  { id: 'proxy-worker', name: 'Proxy_Worker', role: 'Network & Routing', color: '#FFFFFF' },
];

