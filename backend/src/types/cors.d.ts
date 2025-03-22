declare module 'cors' {
  import { RequestHandler } from 'express';

  interface CorsOptions {
    origin?: boolean | string | RegExp | (string | RegExp)[] | ((origin: string, callback: (err: Error | null, allow?: boolean) => void) => void);
    methods?: string | string[];
    allowedHeaders?: string | string[];
    exposedHeaders?: string | string[];
    credentials?: boolean;
    maxAge?: number;
    preflightContinue?: boolean;
    optionsSuccessStatus?: number;
  }

  interface CorsStatic {
    (options?: CorsOptions): RequestHandler;
    (): RequestHandler;
  }

  const cors: CorsStatic;
  export = cors;
}