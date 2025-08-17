// Global type declarations
declare module '*.css' {
  const content: string;
  export default content;
}

declare module 'sonner' {
  export function toast(message: string): void;
  export const toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    warning: (message: string) => void;
    info: (message: string) => void;
  };
  export const Toaster: React.ComponentType<{
    position?: string;
    richColors?: boolean;
  }>;
}

declare module '@github/spark/hooks' {
  export function useKV<T>(key: string, defaultValue: T): [T, (value: T) => void, () => void];
}

// Extend Window interface if needed
declare global {
  interface Window {
    BASE_KV_SERVICE_URL?: string;
  }
}

export {};