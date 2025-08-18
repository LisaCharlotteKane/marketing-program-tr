declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

declare module './main.css';
declare module './index.css';