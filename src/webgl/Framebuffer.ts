import { ShaderEngineImpl } from ".";
import { FrameBuffer, Texture } from "../shader-engine";
import { TextureImpl } from "./Texture";

export class FrameBufferImpl implements FrameBuffer {
  #gl: WebGLRenderingContext;
  #frameBuffer: WebGLFramebuffer;
  #textures: Texture[] = [];
  #engine: ShaderEngineImpl;

  constructor(
    gl: WebGLRenderingContext,
    scale: number,
    engine: ShaderEngineImpl,
  ) {
    this.#gl = gl;
    this.#engine = engine;
    this.#frameBuffer = this.#gl.createFramebuffer()!;
    this.addColorAttachment(
      engine.createTexture(engine.width * scale, engine.height * scale),
    );
  }

  getTexture(index: number = 0): Texture {
    return this.#textures[index];
  }

  addColorAttachment(texture: Texture): void {
    this.#textures.push(texture);
    this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, this.#frameBuffer);
    this.#gl.framebufferTexture2D(
      this.#gl.FRAMEBUFFER,
      this.#gl.COLOR_ATTACHMENT0 + (this.#textures.length - 1),
      this.#gl.TEXTURE_2D,
      (texture as TextureImpl)._getTexture(),
      0,
    );
    this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, null);
  }

  _bind(): void {
    this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, this.#frameBuffer);
  }

  _unbind(): void {
    this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, null);
  }

  dispose(): void {
    if (this.#engine.disposeResource(this)) {
      this.#gl.deleteFramebuffer(this.#frameBuffer);
      this.#textures.forEach((texture) => texture.dispose());
    }
  }
}

