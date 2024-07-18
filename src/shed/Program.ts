import GLEngine, { GLResource, GLResourceOptions } from "../shed";
import Vector2 from "../Vector2";

type Values<T> = T[keyof T];

export const NumberType = {
  Int: "i",
  Float: "f",
} as const;
export type NumberType = Values<typeof NumberType>;

export type Uniform =
  | { type: NumberType; value: number }
  | { type: NumberType; value: Vector2 };

export default class GLProgramWrapper extends GLResource {
  #engine: GLEngine;
  readonly uniforms: Record<string, Uniform> = {};

  constructor(engine: GLEngine, resource: GLResourceOptions) {
    super(resource);
    this.#engine = engine;
  }

  dispose(): void {
    super.dispose();
  }
}

