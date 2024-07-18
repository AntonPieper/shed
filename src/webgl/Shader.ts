import { ShaderEngineImpl } from ".";
import { Shader, Texture } from "../shader-engine";
import { TextureImpl } from "./Texture";

const enum UniformType {
  None,
  Int,
  Int2,
  Int3,
  Int4,
  Float,
  Float2,
  Float3,
  Float4,
  Texture,
}

type Uniform = {
  type: UniformType;
  location: WebGLUniformLocation;
};

export class ShaderImpl implements Shader {
  #gl: WebGLRenderingContext;
  #program: WebGLProgram;
  #engine: ShaderEngineImpl;
  #uniforms = new Map<string, Uniform>();

  constructor(
    gl: WebGLRenderingContext,
    fragment: string,
    vertex: string,
    engine: ShaderEngineImpl,
  ) {
    engine.manageResource(this);
    this.#gl = gl;
    this.#engine = engine;
    this.#program = this.#createProgram(vertex, fragment);
    this.#loadUniforms();
  }

  #createProgram(vertex: string, fragment: string): WebGLProgram {
    const vertexShader = this.#compileShader(this.#gl.VERTEX_SHADER, vertex);
    const fragmentShader = this.#compileShader(
      this.#gl.FRAGMENT_SHADER,
      fragment,
    );

    const program = this.#gl.createProgram()!;
    this.#gl.attachShader(program, vertexShader);
    this.#gl.attachShader(program, fragmentShader);
    this.#gl.linkProgram(program);

    if (!this.#gl.getProgramParameter(program, this.#gl.LINK_STATUS)) {
      throw new Error(
        "Failed to link shader program: " + this.#gl.getProgramInfoLog(program),
      );
    }

    return program;
  }

  #compileShader(type: number, source: string): WebGLShader {
    const shader = this.#gl.createShader(type)!;
    this.#gl.shaderSource(shader, source);
    this.#gl.compileShader(shader);

    if (!this.#gl.getShaderParameter(shader, this.#gl.COMPILE_STATUS)) {
      throw new Error(
        "Failed to compile shader: " + this.#gl.getShaderInfoLog(shader),
      );
    }

    return shader;
  }

  #loadUniforms(): void {
    const numUniforms = this.#gl.getProgramParameter(
      this.#program,
      this.#gl.ACTIVE_UNIFORMS,
    );

    for (let i = 0; i < numUniforms; i++) {
      const uniformInfo = this.#gl.getActiveUniform(this.#program, i);
      if (uniformInfo) {
        const location = this.#gl.getUniformLocation(
          this.#program,
          uniformInfo.name,
        );
        if (location) {
          this.#uniforms.set(uniformInfo.name, {
            type: UniformType.None,
            location,
          });
        }
      }
    }
  }

  #setUniform(
    name: string,
    type: UniformType,
    ...data: number[] | Texture[]
  ): void {
    const uniform = this.#uniforms.get(name);
    if (!uniform) {
      throw new Error(`Uniform ${name} not found in shader program`);
    }

    this.#uniforms.set(name, { type, location: uniform.location });

    this._use();
    switch (type) {
      case UniformType.Int:
        this.#gl.uniform1iv(uniform.location, data as number[]);
        break;
      case UniformType.Int2:
        this.#gl.uniform2iv(uniform.location, data as number[]);
        break;
      case UniformType.Int3:
        this.#gl.uniform3iv(uniform.location, data as number[]);
        break;
      case UniformType.Int4:
        this.#gl.uniform4iv(uniform.location, data as number[]);
        break;
      case UniformType.Float:
        this.#gl.uniform1fv(uniform.location, data as number[]);
        break;
      case UniformType.Float2:
        this.#gl.uniform2fv(uniform.location, data as number[]);
        break;
      case UniformType.Float3:
        this.#gl.uniform3fv(uniform.location, data as number[]);
        break;
      case UniformType.Float4:
        this.#gl.uniform4fv(uniform.location, data as number[]);
        break;
      case UniformType.Texture:
        (data as Texture[]).forEach((texture, i) => {
          this.#gl.activeTexture(this.#gl.TEXTURE0 + i);
          this.#gl.bindTexture(
            this.#gl.TEXTURE_2D,
            (texture as TextureImpl)._getTexture(),
          );
          this.#gl.uniform1i(uniform.location, i);
        });
        break;
      default:
        throw new Error("Unsupported uniform type");
    }
  }

  setInt(name: string, ...data: number[]): void {
    this.#setUniform(name, UniformType.Int, ...data);
  }
  setInt2(name: string, ...data: number[]): void {
    this.#setUniform(name, UniformType.Int2, ...data);
  }
  setInt3(name: string, ...data: number[]): void {
    this.#setUniform(name, UniformType.Int3, ...data);
  }
  setInt4(name: string, ...data: number[]): void {
    this.#setUniform(name, UniformType.Int4, ...data);
  }
  setFloat(name: string, ...data: number[]): void {
    this.#setUniform(name, UniformType.Float, ...data);
  }
  setFloat2(name: string, ...data: number[]): void {
    this.#setUniform(name, UniformType.Float2, ...data);
  }
  setFloat3(name: string, ...data: number[]): void {
    this.#setUniform(name, UniformType.Float3, ...data);
  }
  setFloat4(name: string, ...data: number[]): void {
    this.#setUniform(name, UniformType.Float4, ...data);
  }
  setTexture(name: string, ...data: Texture[]): void {
    this.#setUniform(name, UniformType.Texture, ...data);
  }

  get uniformNames(): Iterable<string> {
    return this.#uniforms.keys();
  }

  _use(): void {
    this.#gl.useProgram(this.#program);
  }

  dispose(): void {
    if (this.#engine.disposeResource(this)) {
      this.#gl.deleteProgram(this.#program);
    }
  }
}

