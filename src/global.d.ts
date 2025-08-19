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

// Spark hooks declarations - using local implementation instead
// declare module '@github/spark/hooks' {
//   export function useKV<T>(key: string, initialValue: T): [T, (value: T) => void, () => void];
// }