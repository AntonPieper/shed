import { ShaderEngineImpl } from ".";
import { Texture } from "../shader-engine";

export class TextureImpl implements Texture {
  #gl: WebGLRenderingContext;
  #texture: WebGLTexture;
  #engine: ShaderEngineImpl;

  constructor(
    gl: WebGLRenderingContext,
    width: number,
    height: number,
    engine: ShaderEngineImpl,
  ) {
    this.#gl = gl;
    this.#engine = engine;
    this.#texture = this.#gl.createTexture()!;
    this.#gl.bindTexture(this.#gl.TEXTURE_2D, this.#texture);
    this.#gl.texImage2D(
      this.#gl.TEXTURE_2D,
      0,
      this.#gl.RGBA,
      width,
      height,
      0,
      this.#gl.RGBA,
      this.#gl.UNSIGNED_BYTE,
      null,
    );
    this.#gl.texParameteri(
      this.#gl.TEXTURE_2D,
      this.#gl.TEXTURE_MIN_FILTER,
      this.#gl.LINEAR,
    );
    this.#gl.texParameteri(
      this.#gl.TEXTURE_2D,
      this.#gl.TEXTURE_MAG_FILTER,
      this.#gl.LINEAR,
    );
    this.#gl.texParameteri(
      this.#gl.TEXTURE_2D,
      this.#gl.TEXTURE_WRAP_S,
      this.#gl.CLAMP_TO_EDGE,
    );
    this.#gl.texParameteri(
      this.#gl.TEXTURE_2D,
      this.#gl.TEXTURE_WRAP_T,
      this.#gl.CLAMP_TO_EDGE,
    );
  }

  _getTexture(): WebGLTexture {
    return this.#texture;
  }

  _bind(): void {
    this.#gl.bindTexture(this.#gl.TEXTURE_2D, this.#texture);
  }

  _unbind(): void {
    this.#gl.bindTexture(this.#gl.TEXTURE_2D, null);
  }

  dispose(): void {
    if (this.#engine.disposeResource(this)) {
      this.#gl.deleteTexture(this.#texture);
    }
  }
}

