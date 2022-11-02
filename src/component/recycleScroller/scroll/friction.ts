/** *
 * Friction physics simulation. Friction is actually just a simple
 * power curve; the only trick is taking the natural log of the
 * initial drag so that we can express the answer in terms of time.
 */
class Friction {
  private _drag: number;
  private _dragLog: number;
  private _x = 0;
  private _v = 0;
  private _startTime = 0;

  constructor(drag: number) {
    this._drag = drag;
    this._dragLog = Math.log(drag);
  }

  set(x: number, v: number, t?: number) {
    this._x = x;
    this._v = v;
    this._startTime = t || Date.now();
  }

  x(t: number) {
    const dt = (t - this._startTime) / 1000.0;
    return (
      this._x +
      (this._v * Math.pow(this._drag, dt)) / this._dragLog -
      this._v / this._dragLog
    );
  }

  dx(t: number) {
    const dt = (t - this._startTime) / 1000.0;
    return this._v * Math.pow(this._drag, dt);
  }

  done(t: number) {
    return Math.abs(this.dx(t)) < 3;
  }
}

export default Friction;
