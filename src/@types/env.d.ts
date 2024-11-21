/**
 * Here init .env variables for ts
 * Ex. :
 * PROD_PASSWORD: string
 *
 * That is made for ts recognized this values
 */
declare namespace NodeJS {
  export interface ProcessEnv {
    PORT: string;
    TRY_CATCH_NAME: string;
    API_KEY_TRY_CATCH_CLOUD: string;
    OPENAI_API_KEY: string;
    ASSISTANT_ID: string;
  }
}
