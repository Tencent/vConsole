export interface TrackerHandler {
  onTouchStart(): void;
  onTouchMove(x: number, y: number): void;
  onTouchEnd(x: number, y: number, velocityX: number, velocityY: number): void;
  onTouchCancel(): void;
  onWheel(x: number, y: number): void;
}

const throttleRAF = (fn: () => void) => {
  let timer: ReturnType<typeof requestAnimationFrame> | null = null;
  let call = false;

  const notify = () => {
    call = false;
    fn();
    timer = requestAnimationFrame(() => {
      timer = null
      if (call) notify()
    });
  }

  const trigger = () => {
    if (timer === null) {
      notify();
    } else {
      call = true;
    }
  }

  const cancel = () => {
    if (timer) {
      cancelAnimationFrame(timer);
      call = false;
      timer = null;
    }
  }

  return {
    trigger,
    cancel,
  }
}

class TouchTracker {
  private _touchId: number | null = null;
  private _startX = 0;
  private _startY = 0;
  private _historyX: number[] = [];
  private _historyY: number[] = [];
  private _historyTime: number[] = [];
  private _wheelDeltaX = 0;
  private _wheelDeltaY = 0;

  constructor(private _handler: TrackerHandler) {}

  private _getTouchDelta(e: TouchEvent): { x: number; y: number } | null {
    if (this._touchId === null) return null;
    for (const touch of e.changedTouches) {
      if (touch.identifier === this._touchId) {
        return {
          x: touch.pageX - this._startX,
          y: touch.pageY - this._startY,
        };
      }
    }
    return null;
  }

  private _onTouchMove = () => {
    const deltaX = this._historyX[this._historyX.length - 1];
    const deltaY = this._historyY[this._historyY.length - 1];
    this._handler.onTouchMove(deltaX, deltaY);
  }

  private _onWheel = throttleRAF(() => {
    const deltaX = this._wheelDeltaX;
    const deltaY = this._wheelDeltaY;

    this._wheelDeltaX = 0;
    this._wheelDeltaY = 0;

    this._handler.onWheel(deltaX, deltaY);
  })

  handleTouchStart = (e: TouchEvent) => {
    if ((<HTMLElement>e.target).dataset?.scrollable === '1') { return; }
    e.preventDefault();

    const touch = e.touches[0];
    this._touchId = touch.identifier;
    this._startX = touch.pageX;
    this._startY = touch.pageY;
    this._historyX = [0];
    this._historyY = [0];
    this._historyTime = [Date.now()];

    this._handler.onTouchStart();
  };

  handleTouchMove = (e: TouchEvent) => {
    if ((<HTMLElement>e.target).dataset?.scrollable === '1') { return; }
    e.preventDefault();

    const delta = this._getTouchDelta(e);
    if (delta === null) return;

    this._historyX.push(delta.x);
    this._historyY.push(delta.y);
    this._historyTime.push(Date.now());

    this._onTouchMove();
  };

  handleTouchEnd = (e: TouchEvent) => {
    if ((<HTMLElement>e.target).dataset?.scrollable === '1') { return; }
    e.preventDefault();

    const delta = this._getTouchDelta(e);
    if (delta === null) return;

    let velocityX = 0;
    let velocityY = 0;
    const lastTime = Date.now();
    const lastY = delta.y;
    const lastX = delta.x;
    const historyTime = this._historyTime;
    for (let i = historyTime.length - 1; i > 0; i -= 1) {
      const t = historyTime[i];
      const dt = lastTime - t;
      if (dt > 30) {
        velocityX = ((lastX - this._historyX[i]) * 1000) / dt;
        velocityY = ((lastY - this._historyY[i]) * 1000) / dt;
        break;
      }
    }

    this._touchId = null;

    // ;(window as any)._vcOrigConsole.log('onTouchEnd', delta, velocityX, velocityY);
    this._handler.onTouchEnd(delta.x, delta.y, velocityX, velocityY);
  };

  handleTouchCancel = (e: TouchEvent) => {
    if ((<HTMLElement>e.target).dataset?.scrollable === '1') { return; }
    e.preventDefault();

    const delta = this._getTouchDelta(e);
    if (delta === null) return;

    this._touchId = null;

    // ;(window as any)._vcOrigConsole.log('onTouchCancel');
    this._handler.onTouchCancel();
  };

  handleWheel = (e: WheelEvent) => {
    if ((<HTMLElement>e.target).dataset?.scrollable === '1') { return; }
    e.preventDefault();

    this._wheelDeltaX += e.deltaX;
    this._wheelDeltaY += e.deltaY;

    this._onWheel.trigger();
    // ;(window as any)._vcOrigConsole.log('onWheel', e.target);
  };
}

export default TouchTracker;
