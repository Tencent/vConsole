/**
 * A ResizeObserver polyfill.
 * ResizeObserver is not support in iOS 13.3
 */
class EmptyResizeObserver {
  constructor(callback: (entries: any[], observer?: EmptyResizeObserver) => void) {
    // do nothing
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

export const ResizeObserverPolyfill = window.ResizeObserver || EmptyResizeObserver;
