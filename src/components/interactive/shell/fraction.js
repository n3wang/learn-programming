/** Minimal exact-rational arithmetic — avoids float drift when clearing
 * denominators or combining decimal coefficients (2.5, 1.2, 3.6, ...). */

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a || 1;
}

export class Fraction {
  constructor(num, den = 1) {
    if (den < 0) {
      num = -num;
      den = -den;
    }
    const g = gcd(num, den) || 1;
    this.num = num / g;
    this.den = den / g;
  }

  add(o) {
    return new Fraction(this.num * o.den + o.num * this.den, this.den * o.den);
  }

  sub(o) {
    return new Fraction(this.num * o.den - o.num * this.den, this.den * o.den);
  }

  mul(o) {
    return new Fraction(this.num * o.num, this.den * o.den);
  }

  div(o) {
    return new Fraction(this.num * o.den, this.den * o.num);
  }

  neg() {
    return new Fraction(-this.num, this.den);
  }

  isZero() {
    return this.num === 0;
  }

  equals(o) {
    return this.num * o.den === o.num * this.den;
  }

  toNumber() {
    return this.num / this.den;
  }

  /** "a/b" (or just "a" when it's a whole number), sign folded into the numerator. */
  toDisplayString() {
    if (this.den === 1) return `${this.num}`;
    return `${this.num}/${this.den}`;
  }
}

export function frac(num, den = 1) {
  return new Fraction(num, den);
}

export function lcm(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  return (a * b) / gcd(a, b);
}
