/// <reference types="vite/client" />
/// <reference types="vite/types/importMeta.d.ts" />

interface ImportMetaEnv {
      readonly VITE_API_URL: string;
      readonly VITE_SOME_OTHER_VARIABLE: string;
      // Add other environment variables if needed
    }

    interface ImportMeta {
      readonly env: ImportMetaEnv;
    }