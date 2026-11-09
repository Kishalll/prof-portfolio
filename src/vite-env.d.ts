/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Background style for every page: 'waves' (default) | 'honeycomb' | 'none' */
  readonly VITE_BACKGROUND_STYLE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
