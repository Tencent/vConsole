/**
 * A ResizeObserver polyfill.
 * ResizeObserver is not support in iOS 13.3
 */
class EmptyResizeObserver {
  constructor(callback: (entries: any[], observer?: EmptyResizeObserver) => void) {
    console.debug('[vConsole] `ResizeObserver` is not supported in the browser, vConsole cannot render correctly.');
    const entries = [{
      contentRect: { height: 30 },
    }];
    callback(entries, this);
  }

  public disconnect() {
    // do nothing
  }

  public observe(target: Element | SVGElement, options?: any) {
    // do nothing
  }

  public unobserve(target: Element | SVGElement) {
    // do nothing
  }
}

export const hasResizeObserver = () => {
  // return false;
  return typeof window.ResizeObserver === 'function';
};

export const useResizeObserver = () => {
  // return EmptyResizeObserver;
  return window.ResizeObserver || EmptyResizeObserver;
};
