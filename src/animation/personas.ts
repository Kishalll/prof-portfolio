import { AgentPersona } from './types';

export const DEFAULT_PERSONA_POOL: AgentPersona[] = [
  { id: 'dev-kishal', name: 'Dev [Kishal]', role: 'Lead Architect', color: '#CCFF00' },
  { id: 'ui-design', name: 'UI_Design', role: 'Layout Engine', color: '#CCFF00' },
  { id: 'secops', name: 'SecOps', role: 'Cryptographic Auth', color: '#FFFF00' },
  { id: 'qa-audit', name: 'QA_Audit', role: 'Assertions & Bounds', color: '#FFFF00' },
  { id: 'ai-agent', name: 'AI_Agent', role: 'RAG Pipeline', color: '#DFFF00' },
  { id: 'kernel', name: 'Kernel', role: 'Systems Tooling', color: '#DFFF00' },
  { id: 'reviewer', name: 'Reviewer', role: 'Code Quality', color: '#FFFFFF' },
  { id: 'syntax-bot', name: 'Syntax_Worker', role: 'Runtime Tokens', color: '#CCFF00' },
  { id: 'layout-bot', name: 'Layout_Worker', role: 'Flex Grids', color: '#FFFF00' },
  { id: 'rag-worker', name: 'RAG_Worker', role: 'Vector DB', color: '#DFFF00' },
  { id: 'crypto-bot', name: 'Crypto_Worker', role: 'P-256 Signature', color: '#CCFF00' },
  { id: 'proxy-worker', name: 'Proxy_Worker', role: 'Session Routing', color: '#FFFFFF' },
];

