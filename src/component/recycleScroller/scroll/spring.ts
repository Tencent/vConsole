const epsilon = 0.1;
const almostEqual = (a: number, b: number) =>
  a > b - epsilon && a < b + epsilon;
const almostZero = (a: number) => almostEqual(a, 0);

/***
 * Simple Spring implementation -- this implements a damped spring using a symbolic integration
 * of Hooke's law: F = -kx - cv. This solution is significantly more performant and less code than
 * a numerical approach such as Facebook Rebound which uses RK4.
 *
 * This physics textbook explains the model:
 *  http://www.stewartcalculus.com/data/CALCULUS%20Concepts%20and%20Contexts/upfiles/3c3-AppsOf2ndOrders_Stu.pdf
 *
 * A critically damped spring has: damping*damping - 4 * mass * springConstant == 0. If it's greater than zero
 * then the spring is overdamped, if it's less than zero then it's underdamped.
 */
const getSolver = (
  mass: number,
  springConstant: number,
  damping: number
): ((
  initial: number,
  velocity: number
) => { x: (t: number) => number; dx: (t: number) => number }) => {
  const c = damping;
  const m = mass;
  const k = springConstant;
  const cmk = c * c - 4 * m * k;
  if (cmk == 0) {
    // The spring is critically damped.
    // x = (c1 + c2*t) * e ^(-c/2m)*t
    const r = -c / (2 * m);
    return (initial, velocity) => {
      const c1 = initial;
      const c2 = velocity / (r * initial);
      return {
        x: (dt) => (c1 + c2 * dt) * Math.pow(Math.E, r * dt),
        dx: (dt) => (r * (c1 + c2 * dt) + c2) * Math.pow(Math.E, r * dt),
      };
    };
  } else if (cmk > 0) {
    // The spring is overdamped; no bounces.
    // x = c1*e^(r1*t) + c2*e^(r2t)
    // Need to find r1 and r2, the roots, then solve c1 and c2.
    const r1 = (-c - Math.sqrt(cmk)) / (2 * m);
    const r2 = (-c + Math.sqrt(cmk)) / (2 * m);
    return (initial, velocity) => {
      const c2 = (velocity - r1 * initial) / (r2 - r1);
      const c1 = initial - c2;

      return {
        x: (dt) => c1 * Math.pow(Math.E, r1 * dt) + c2 * Math.pow(Math.E, r2 * dt),
        dx: (dt) =>
          c1 * r1 * Math.pow(Math.E, r1 * dt) +
          c2 * r2 * Math.pow(Math.E, r2 * dt),
      };
    };
  } else {
    // The spring is underdamped, it has imaginary roots.
    // r = -(c / 2*m) +- w*i
    // w = sqrt(4mk - c^2) / 2m
    // x = (e^-(c/2m)t) * (c1 * cos(wt) + c2 * sin(wt))
    const w = Math.sqrt(4 * m * k - c * c) / (2 * m);
    const r = -((c / 2) * m);
    return (initial, velocity) => {
      const c1 = initial;
      const c2 = (velocity - r * initial) / w;

      return {
        x: (dt) =>
          Math.pow(Math.E, r * dt) *
          (c1 * Math.cos(w * dt) + c2 * Math.sin(w * dt)),
        dx: (dt) => {
          const power = Math.pow(Math.E, r * dt);
          const cos = Math.cos(w * dt);
          const sin = Math.sin(w * dt);
          return (
            power * (c2 * w * cos - c1 * w * sin) +
            r * power * (c2 * sin + c1 * cos)
          );
        },
      };
    };
  }
};

class Spring {

  private _solver: (
    initial: number,
    velocity: number
  ) => {
    x: (dt: number) => number;
    dx: (dt: number) => number;
  };
  private _solution: {
    x: (dt: number) => number;
    dx: (dt: number) => number;
  } | null;
  private _endPosition: number;
  private _startTime: number;

  constructor(mass: number, springConstant: number, damping: number) {
    this._solver = getSolver(mass, springConstant, damping);
    this._solution = null;
    this._endPosition = 0;
    this._startTime = 0;
  }
  x(t: number) {
    if (!this._solution) return 0;
    const dt = (t - this._startTime) / 1000.0;
    return this._endPosition + this._solution.x(dt);
  }
  dx(t: number) {
    if (!this._solution) return 0;
    const dt = (t - this._startTime) / 1000.0;
    return this._solution.dx(dt);
  }
  set(endPosition: number, x: number, velocity: number, t?: number) {
    if (!t) t = Date.now();
    this._endPosition = endPosition;
    if (x == endPosition && almostZero(velocity)) return;
    this._solution = this._solver(x - endPosition, velocity);
    this._startTime = t;
  }
  done(t: number) {
    if (!t) t = Date.now();
    return almostEqual(this.x(t), this._endPosition) && almostZero(this.dx(t));
  }
}

export default Spring;
