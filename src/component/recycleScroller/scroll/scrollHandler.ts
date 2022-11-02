import Linear from './linear';
import Scroll from './scroll';
import { TrackerHandler } from './touchTracker';

// This function sets up a requestAnimationFrame-based timer which calls
// the callback every frame while the physics model is still moving.
// It returns a function that may be called to cancel the animation.
function animation(
  physicsModel: { done: (t: number) => boolean },
  callback: (t: number) => void
) {
  let id: ReturnType<typeof requestAnimationFrame>;
  let cancelled: boolean;

  const onFrame = () => {
    if (cancelled) return;
    const t = Date.now();
    callback(t);
    if (physicsModel.done(t)) return;
    id = requestAnimationFrame(onFrame);
  };

  const cancel = () => {
    cancelAnimationFrame(id);
    cancelled = true;
  };

  onFrame();

  return { cancel };
}

const UNDERSCROLL_TRACKING = 0;

class ScrollHandler implements TrackerHandler {
  private _scrollModel: Scroll;
  private _linearModel: Linear;
  private _startPosition = 0;
  private _position = 0;
  private _animate: ReturnType<typeof animation> | null = null;
  private _getExtent: () => number;

  constructor(
    getExtent: () => number,
    private _updatePosition: (pos: number) => void
  ) {
    this._getExtent = getExtent;
    this._scrollModel = new Scroll(getExtent, false);
    this._linearModel = new Linear();
  }

  onTouchStart() {
    let pos = this._position;

    if (pos > 0) {
      pos *= UNDERSCROLL_TRACKING;
    } else {
      const extent = this._getExtent();
      if (pos < -extent) {
        pos = (pos + extent) * UNDERSCROLL_TRACKING - extent;
      }
    }

    this._startPosition = this._position = pos;

    if (this._animate) {
      this._animate.cancel();
      this._animate = null;
    }

    this._updatePosition(-pos);
  }

  onTouchMove(dx: number, dy: number) {
    let pos = dy + this._startPosition;

    if (pos > 0) {
      pos *= UNDERSCROLL_TRACKING;
    } else {
      const extent = this._getExtent();
      if (pos < -extent) {
        pos = (pos + extent) * UNDERSCROLL_TRACKING - extent;
      }
    }

    this._position = pos;

    this._updatePosition(-pos);
  }

  onTouchEnd(dx: number, dy: number, velocityX: number, velocityY: number) {
    let pos = dy + this._startPosition;

    if (pos > 0) {
      pos *= UNDERSCROLL_TRACKING;
    } else {
      const extent = this._getExtent();
      if (pos < -extent) {
        pos = (pos + extent) * UNDERSCROLL_TRACKING - extent;
      }
    }
    this._position = pos;
    this._updatePosition(-pos);
    if (Math.abs(dy) <= 0.1 && Math.abs(velocityY) <= 0.1) return;
    const scroll = this._scrollModel;
    scroll.set(pos, velocityY);
    this._animate = animation(scroll, (t) => {
      const pos = (this._position = scroll.x(t));
      this._updatePosition(-pos);
    });
  }

  onTouchCancel(): void {
    let pos = this._position;

    if (pos > 0) {
      pos *= UNDERSCROLL_TRACKING;
    } else {
      const extent = this._getExtent();
      if (pos < -extent) {
        pos = (pos + extent) * UNDERSCROLL_TRACKING - extent;
      }
    }

    this._position = pos;
    const scroll = this._scrollModel;
    scroll.set(pos, 0);
    this._animate = animation(scroll, (t) => {
      const pos = (this._position = scroll.x(t));
      this._updatePosition(-pos);
    });
  }

  onWheel(x: number, y: number): void {
    let pos = this._position - y;

    if (this._animate) {
      this._animate.cancel();
      this._animate = null;
    }

    if (pos > 0) {
      pos = 0;
    } else {
      const extent = this._getExtent();
      if (pos < -extent) {
        pos = -extent;
      }
    }

    this._position = pos;

    this._updatePosition(-pos);
  }

  getPosition() {
    return -this._position;
  }

  updatePosition(position: number) {
    const dx = -position - this._position;
    this._startPosition += dx;
    this._position += dx;
    const pos = this._position;

    this._updatePosition(-pos);

    const scroll = this._scrollModel;
    const t = Date.now();
    if (!scroll.done(t)) {
      const dx = scroll.dx(t);
      scroll.set(pos, dx, t);
    }
  }

  scrollTo(position: number, duration?: number) {
    if (this._animate) {
      this._animate.cancel();
      this._animate = null
    }
    if (duration > 0) {
      const linearModel = this._linearModel;
      linearModel.set(this._position, -position, duration);
      this._animate = animation(this._linearModel, (t) => {
        const pos = (this._position = linearModel.x(t));
        this._updatePosition(-pos);
      });
    } else {
      this._updatePosition(position);
    }
  }
}

export default ScrollHandler;
