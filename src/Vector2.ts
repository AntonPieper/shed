export interface Vector2Like {
  readonly x: number;
  readonly y: number;
}

export default class Vector2 {
  constructor(
    public x = 0,
    public y = x,
  ) {}

  set(other: Vector2Like): this {
    this.x = other.x;
    this.y = other.y;
    return this;
  }

  setXY(x = 0, y = x): this {
    this.x = x;
    this.y = y;
    return this;
  }

  clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  addXY(x: number, y: number): this {
    this.x += x;
    this.y += y;
    return this;
  }

  add(other: Vector2Like): this {
    return this.addXY(other.x, other.y);
  }

  subXY(x: number, y: number): this {
    this.x -= x;
    this.y -= y;
    return this;
  }

  sub(other: Vector2Like): this {
    return this.subXY(other.x, other.y);
  }

  divXY(x: number, y: number): this {
    this.x /= x;
    this.y /= y;
    return this;
  }

  div(other: Vector2Like): this {
    return this.divXY(other.x, other.y);
  }

  mulXY(x: number, y: number): this {
    this.x *= x;
    this.y *= y;
    return this;
  }

  mul(other: Vector2Like): this {
    return this.mulXY(other.x, other.y);
  }

  scale(value: number): this {
    return this.mulXY(value, value);
  }

  dot(other: Vector2Like): number {
    return this.x * other.x + this.y * other.y;
  }

  lengthSq(): number {
    return this.dot(this);
  }

  length(): number {
    return Math.hypot(this.x, this.y);
  }

  normalize(length = 1): this {
    const lengthSq = this.lengthSq();
    if (lengthSq !== 0) {
      this.scale(length / Math.sqrt(lengthSq));
    }
    return this;
  }
}
