import GLEngine, { GLResource, GLResourceOptions } from "../shed";

export default class GLFramebufferWrapper extends GLResource {
  #engine: GLEngine;

  constructor(engine: GLEngine, resource: GLResourceOptions) {
    super(resource);
    this.#engine = engine;
  }

  dispose(): void {
    super.dispose();
  }
}
