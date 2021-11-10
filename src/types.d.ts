declare module '*.html' {
  const _: string;
  export default _;
}

declare module '*.less' {
  const use: () => void;
  export { use };
}
