export interface Vector3Like {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export default class Vector3 {
  x: number;
  y: number;
  z: number;

  constructor(x = 0, y?: number, z?: number) {
    this.x = x;
    if ((y === z) === undefined) {
      this.y = this.z = x;
    } else {
      this.y = y ?? 0;
      this.z = z ?? 0;
    }
  }

  set(other: Vector3Like): this {
    this.x = other.x;
    this.y = other.y;
    this.z = other.z;
    return this;
  }

  setXYZ(x = 0, y?: number, z?: number): this {
    this.x = x;
    if ((y === z) === undefined) {
      this.y = this.z = x;
    } else {
      this.y = y ?? 0;
      this.z = z ?? 0;
    }
    return this;
  }

  clone(): Vector3 {
    return new Vector3(this.x, this.y, this.z);
  }

  addXYZ(x: number, y: number, z: number): this {
    this.x += x;
    this.y += y;
    this.z += z;
    return this;
  }

  add(other: Vector3Like): this {
    return this.addXYZ(other.x, other.y, other.z);
  }

  subXYZ(x: number, y: number, z: number): this {
    this.x -= x;
    this.y -= y;
    this.z -= z;
    return this;
  }

  sub(other: Vector3Like): this {
    return this.subXYZ(other.x, other.y, other.z);
  }

  divXYZ(x: number, y: number, z: number): this {
    this.x /= x;
    this.y /= y;
    this.z /= z;
    return this;
  }

  div(other: Vector3Like): this {
    return this.divXYZ(other.x, other.y, other.z);
  }

  mulXYZ(x: number, y: number, z: number): this {
    this.x *= x;
    this.y *= y;
    this.z *= z;
    return this;
  }

  mul(other: Vector3Like): this {
    return this.mulXYZ(other.x, other.y, other.z);
  }

  scale(value: number): this {
    return this.mulXYZ(value, value, value);
  }

  dot(other: Vector3Like): number {
    return this.x * other.x + this.y * other.y + this.z * other.z;
  }

  lengthSq(): number {
    return this.dot(this);
  }

  length(): number {
    return Math.hypot(this.x, this.y, this.z);
  }

  normalize(length = 1): this {
    const lengthSq = this.lengthSq();
    if (lengthSq !== 0) {
      this.scale(length / Math.sqrt(lengthSq));
    }
    return this;
  }
}
