import GLFramebufferWrapper from "./shed/Framebuffer";
import GLProgramWrapper from "./shed/Program";
import GLTextureWrapper from "./shed/Texture";

const enum ShaderErrorType {
  Fragment,
  Vertex,
  Link,
}

const enum ShaderType {
  Fragment,
  Vertex,
}

function glShaderType(gl: WebGLRenderingContext, type: ShaderType): GLenum {
  switch (type) {
    case ShaderType.Fragment:
      return gl.FRAGMENT_SHADER;
    case ShaderType.Vertex:
      return gl.VERTEX_SHADER;
  }
}

function shaderTypeToErrorType(type: ShaderType) {
  switch (type) {
    case ShaderType.Fragment:
      return ShaderErrorType.Fragment;
    case ShaderType.Vertex:
      return ShaderErrorType.Vertex;
  }
}

// Default vertex shaders
const defaultVertexShader300es = `#version 300 es
layout(location = 0) in vec4 a_position;
void main() {
  gl_Position = a_position;
}`;

const defaultVertexShader100 = `#version 100
attribute vec4 a_position;
void main() {
  gl_Position = a_position;
}`;

export interface Disposable {
  dispose(): void;
}

export type Disposer<T> = (value: T) => void;

export interface ResourceOptions<T> {
  value: T;
  disposer: Disposer<T>;
}

class Resource<T extends {}> implements Disposable {
  #value: T | null;
  readonly #disposer: Disposer<T>;

  constructor(resource: ResourceOptions<T>) {
    this.#value = resource.value;
    this.#disposer = resource.disposer;
  }

  get value(): T | null {
    return this.#value;
  }

  dispose(): void {
    if (this.#value !== null) {
      this.#disposer(this.#value);
      this.#value = null;
    }
  }
}

export type ResourceID = number;
export type GLResourceOptions = ResourceOptions<ResourceID>;
export abstract class GLResource extends Resource<ResourceID> {}

export class ShaderError extends Error {
  constructor(
    public type: ShaderErrorType,
    ...args: ConstructorParameters<typeof Error>
  ) {
    super(...args);
  }
}

type GLEngineHandlerEntry = {
  dispose: Disposer<ResourceID>;
  destroyResource: (...args: any[]) => void;
};

export default class GLEngine {
  #resourceIDCount = 0;
  #gl: WebGL2RenderingContext;
  #programs = new Map<ResourceID, WebGLProgram>();
  #textures = new Map<ResourceID, WebGLTexture>();
  #framebuffers = new Map<ResourceID, WebGLTexture>();
  #handlers = {
    program: {
      dispose: (id) => {
        const program = this.#programs.get(id);
        if (program !== undefined) {
          this.#handlers.program.destroyResource(program);
          this.#programs.delete(id);
        }
      },
      destroyResource: (program: WebGLProgram) => {
        this.#gl.deleteProgram(program);
      },
    },

    texture: {
      dispose: (id) => {
        const texture = this.#textures.get(id);
        if (texture !== undefined) {
          this.#handlers.texture.destroyResource(texture);
          this.#textures.delete(id);
        }
      },
      destroyResource: (texture: WebGLTexture) => {
        this.#gl.deleteTexture(texture);
      },
    },

    framebuffer: {
      dispose: (id) => {
        const framebuffer = this.#framebuffers.get(id);
        if (framebuffer !== undefined) {
          this.#handlers.framebuffer.destroyResource(framebuffer);
          this.#framebuffers.delete(id);
        }
      },
      destroyResource: (framebuffer: WebGLFramebuffer) => {
        this.#gl.deleteFramebuffer(framebuffer);
      },
    },
  } satisfies Record<string, GLEngineHandlerEntry>;

  constructor(gl: WebGL2RenderingContext) {
    this.#gl = gl;
  }

  #nextID() {
    return this.#resourceIDCount++;
  }

  /**
   * Creates a new shader.
   *
   * @throws {ShaderError} if compilation fails.
   */
  createProgram(fragmentSource: string, vertexSource?: string) {
    // Detect GLSL version in fragment shader
    const is300es = fragmentSource.includes("#version 300 es");

    // Select the default vertex shader if none is provided
    if (vertexSource === undefined) {
      vertexSource = is300es
        ? defaultVertexShader300es
        : defaultVertexShader100;
    }

    // Compile shaders
    const vertexShader = this.#compileShader(ShaderType.Vertex, vertexSource);
    const fragmentShader = this.#compileShader(
      ShaderType.Fragment,
      fragmentSource,
    );

    // Link program
    const program = this.#gl.createProgram()!;
    this.#gl.attachShader(program, vertexShader);
    this.#gl.attachShader(program, fragmentShader);
    this.#gl.linkProgram(program);

    // Mark for deletion
    this.#gl.deleteShader(fragmentShader);
    this.#gl.deleteShader(vertexShader);

    // Check program linking
    if (!this.#gl.getProgramParameter(program, this.#gl.LINK_STATUS)) {
      const msg = this.#gl.getProgramInfoLog(program)!;
      console.error("Program linking failed:", msg);
      this.#gl.deleteProgram(program);
      throw new ShaderError(ShaderErrorType.Link, msg);
    }

    const id = this.#nextID();
    this.#programs.set(id, program);
    return new GLProgramWrapper(this, {
      value: id,
      disposer: this.#handlers.program.dispose,
    });
  }

  #compileShader(type: ShaderType, source: string) {
    const shader = this.#gl.createShader(glShaderType(this.#gl, type))!;
    this.#gl.shaderSource(shader, source);
    this.#gl.compileShader(shader);

    if (!this.#gl.getShaderParameter(shader, this.#gl.COMPILE_STATUS)) {
      const msg = this.#gl.getShaderInfoLog(shader)!;
      console.error("Shader compilation failed:", msg);
      this.#gl.deleteShader(shader);
      const errorType = shaderTypeToErrorType(type);
      throw new ShaderError(errorType, msg);
    }

    return shader;
  }

  createTexture() {
    const texture = this.#gl.createTexture()!;
    const id = this.#nextID();
    this.#textures.set(id, texture);
    return new GLTextureWrapper(this, {
      value: id,
      disposer: this.#handlers.texture.dispose,
    });
  }

  createFramebuffer() {
    const framebuffer = this.#gl.createFramebuffer()!;
    const id = this.#nextID();
    this.#framebuffers.set(id, framebuffer);
    return new GLFramebufferWrapper(this, {
      value: id,
      disposer: this.#handlers.framebuffer.dispose,
    });
  }

  dispose() {
    for (const program of this.#programs.values()) {
      this.#handlers.program.destroyResource(program);
    }
    for (const texture of this.#textures.values()) {
      this.#handlers.texture.destroyResource(texture);
    }
    for (const framebuffer of this.#framebuffers.values()) {
      this.#handlers.framebuffer.destroyResource(framebuffer);
    }
    this.#programs.clear();
    this.#textures.clear();
    this.#framebuffers.clear();
  }
}
