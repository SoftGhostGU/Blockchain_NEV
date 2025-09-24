export {};

declare global {
  interface Window {
    envConfig: {
      key: number;
      proxy: boolean;
      ISROUTER: boolean;
      API_BASE_URL?: string;
      API_BASE_PORT?: string;
      API_BASE_TIMEOUT?: number;
    };
  }
}
