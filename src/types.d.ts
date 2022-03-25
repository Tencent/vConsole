declare var __VERSION__: string;
declare var __TARGET__: 'web' | 'wx';

declare module '*.html' {
  const _: string;
  export default _;
}

declare module '*.less' {
  const use: () => void;
  const unuse: () => void;
  export { use, unuse };
}
