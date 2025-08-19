// CSS Module declarations
declare module '*.css' {
  const content: string;
  export default content;
}

declare module './main.css' {
  const content: string;
  export default content;
}

declare module './index.css' {
  const content: string;
  export default content;
}

// Sonner toast type declarations
declare module 'sonner' {
  export function toast(message: string): void;
  export const Toaster: React.ComponentType<any>;
}

// React types extensions
declare global {
  namespace React {
    interface CSSProperties {
      [key: `--${string}`]: string | number;
    }
  }
}

// GitHub Spark types (if used)
// Using local hooks instead of @github/spark/hooks

// PapaParse types
declare module 'papaparse' {
  export interface ParseResult<T> {
    data: T[];
    errors: any[];
    meta: {
      delimiter: string;
      linebreak: string;
      aborted: boolean;
      truncated: boolean;
      cursor: number;
    };
  }

  export function parse<T = any>(
    csv: string,
    config?: {
      header?: boolean;
      skipEmptyLines?: boolean;
      transform?: (value: string) => any;
    }
  ): ParseResult<T>;
}

export {};