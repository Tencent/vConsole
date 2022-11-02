import Friction from './friction';
import Spring from './spring';

/** *
 * Scroll combines Friction and Spring to provide the
 * classic "flick-with-bounce" behavior.
 */
class Scroll {
  private _getExtend: () => number;
  private _friction = new Friction(0.05);
  private _spring = new Spring(1, 90, 20);
  private _toEdge = false;

  constructor(getExtend: () => number, private _enableSpring: boolean) {
    this._getExtend = getExtend;
  }

  set(x: number, v: number, t?: number) {
    if (t === undefined) t = Date.now();
    this._friction.set(x, v, t);

    // If we're over the extent or zero then start springing. Notice that we also consult
    // velocity because we don't want flicks that start in the overscroll to get consumed
    // by the spring.
    if (x > 0 && v >= 0) {
      this._toEdge = true;
      if (this._enableSpring) {
        this._spring.set(0, x, v, t);
      }
    } else {
      const extent = this._getExtend();
      if (x < -extent && v <= 0) {
        this._toEdge = true;
        if (this._enableSpring) {
          this._spring.set(-extent, x, v, t);
        }
      } else {
        this._toEdge = false;
      }
    }
  }

  x(t: number) {
    // We've entered the spring, use the value from there.
    if (this._enableSpring && this._toEdge) {
      return this._spring.x(t);
    }
    // We're still in friction.
    const x = this._friction.x(t);
    const dx = this._friction.dx(t);
    // If we've gone over the edge the roll the momentum into the spring.
    if (x > 0 && dx >= 0) {
      this._toEdge = true;
      if (this._enableSpring) {
        this._spring.set(0, x, dx, t);
      } else {
        return 0;
      }
    } else {
      const extent = this._getExtend();
      if (x < -extent && dx <= 0) {
        this._toEdge = true;
        if (this._enableSpring) {
          this._spring.set(-extent, x, dx, t);
        } else {
          return -extent;
        }
      }
    }
    return x;
  }

  dx(t: number) {
    if (!this._toEdge) return this._friction.dx(t);
    if (this._enableSpring) return this._spring.dx(t);
    return 0;
  }

  done(t: number) {
    if (!this._toEdge) return this._friction.done(t);
    if (this._enableSpring) return this._spring.done(t);
    return true;
  }
}

export default Scroll;
