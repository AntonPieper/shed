import GLEngine, { GLResource, GLResourceOptions } from "../shed";

export default class GLTextureWrapper extends GLResource {
  #engine: GLEngine;

  constructor(engine: GLEngine, resource: GLResourceOptions) {
    super(resource);
    this.#engine = engine;
  }

  dispose(): void {
    super.dispose();
  }
}
