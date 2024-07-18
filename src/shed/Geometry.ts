type TypedArray =
  | Float32Array
  | Float64Array
  | Uint32Array
  | Int32Array
  | Uint16Array
  | Int16Array
  | Uint8Array
  | Int8Array
  | Uint8ClampedArray;

export class BufferAttribute<T extends TypedArray> {
  buffer: T;
  itemSize: number;
  count: number;
  normalized: boolean;

  constructor(buffer: T, itemSize: number, normalized = false) {
    if (!buffer || itemSize <= 0) {
      throw new Error(
        "BufferAttribute: array should be defined and itemSize should be greater than zero.",
      );
    }

    this.buffer = buffer;
    this.itemSize = itemSize;
    this.count = buffer.length / itemSize;
    this.normalized = normalized;
  }

  set(value: ArrayLike<number>, offset = 0): this {
    this.buffer.set(value, offset);
    return this;
  }

  get(offset: number, into: T): T {
    into.set(this.buffer, offset);
    return into;
  }

  clone(): BufferAttribute<T> {
    return new BufferAttribute(
      this.buffer.slice() as T,
      this.itemSize,
      this.normalized,
    );
  }

  copy(source: BufferAttribute<T>): this {
    this.buffer.set(source.buffer);
    this.itemSize = source.itemSize;
    this.count = source.count;
    this.normalized = source.normalized;
    return this;
  }
}
