declare const __DEV__: boolean;

export const logger = {
  info: (message: string, ...args: any[]) => {
    console.log(`[INFO] ${message}`, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${message}`, ...args);
  },
  debug: (message: string, ...args: any[]) => {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  },
};

export default logger;
