/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_RAZORPAY_KEY_ID: string;
    readonly VITE_APP_TOLGEE_API_URL: string;
    readonly VITE_APP_TOLGEE_API_KEY: string;  
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
  

