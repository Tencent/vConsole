class Linear {
  private _x = 0;
  private _endX = 0;
  private _v = 0;
  private _startTime = 0;
  private _endTime = 0;

  set(x: number, endX: number, dt: number, t?: number) {
    this._x = x;
    this._endX = endX;
    this._v = (endX - x) / dt;
    this._startTime = t || Date.now();
    this._endTime = this._startTime + dt;
  }

  x(t: number) {
    if (this.done(t)) return this._endX;
    const dt = t - this._startTime;
    return this._x + this._v * dt;
  }

  dx(t: number) {
    if (this.done(t)) return 0;
    return this._v;
  }

  done(t: number) {
    return t >= this._endTime;
  }
}

export default Linear;
