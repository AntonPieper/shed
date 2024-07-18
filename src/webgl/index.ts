import { AttributeType, Disposable, DisposableManager, FrameBuffer, Mesh, MeshOptions, ProvidersMap, RenderOptions, Shader, ShaderEngine, Texture } from "../shader-engine";
import { FrameBufferImpl } from "./Framebuffer";
import { MeshImpl } from "./Mesh";
import { ShaderImpl } from "./Shader";
import { TextureImpl } from "./Texture";

class ResourceManager implements DisposableManager {
  #resources = new Map<Disposable, boolean>();

  manageResource(resource: Disposable) {
    this.#resources.set(resource, false);
  }

  /**
   * Disposes a resource.
   *
   * Returns `false` if the resource has already been
   * disposed or is not managed by this manager.
   *
   * <p>
   * Note: Do not call this method unconditionally inside the {@link Disposable.dispose} method. This will result in
   * a double dispose.
   * </p>
   */
  disposeResource(resource: Disposable): boolean {
    if (!this.#resources.has(resource)) {
      return false;
    }

    const shouldBeDisposed = this.#resources.get(resource);
    if (shouldBeDisposed) {
      return this.#resources.delete(resource);
    }

    // Mark resource as potentially disposed
    this.#resources.set(resource, true);
    // Dispose resource
    resource.dispose();
    // Definitly disposed now. Delete resource if
    // not already removed by the resource's dispose
    // method.
    this.#resources.delete(resource);
    return true;
  }
}

export class ShaderEngineImpl extends ResourceManager implements ShaderEngine {
  #gl: WebGL2RenderingContext;
  #resources = new Set<Disposable>();
  #running: boolean = true;
  #startTime = performance.now();
  #time: number = 0;
  #width: number;
  #height: number;
  #defaultMesh: MeshImpl;

  constructor(canvas: HTMLCanvasElement) {
    super();
    this.#gl = canvas.getContext("webgl2")!;
    if (this.#gl === null) {
      throw new Error("WebGL 2 is not supported by this browser");
    }
    this.#width = canvas.width;
    this.#height = canvas.height;
    this.#defaultMesh = this.createMesh(defaultMesh) as MeshImpl;
  }

  initProvider<T extends keyof ProvidersMap>(type: T): ProvidersMap[T] {
    throw new Error("Method not implemented.");
  }

  clear(): void {
    this.#gl.clear(this.#gl.COLOR_BUFFER_BIT | this.#gl.DEPTH_BUFFER_BIT);
  }

  createShader(fragment: string, vertex: string = defaultVertexShader): Shader {
    const shader = new ShaderImpl(this.#gl, fragment, vertex, this);
    this.#resources.add(shader);
    return shader;
  }

  createFrameBuffer(scale: number): FrameBuffer {
    const frameBuffer = new FrameBufferImpl(this.#gl, scale, this);
    this.#resources.add(frameBuffer);
    return frameBuffer;
  }

  createTexture(width: number, height: number): Texture {
    const texture = new TextureImpl(this.#gl, width, height, this);
    this.#resources.add(texture);
    return texture;
  }

  createMesh(options: MeshOptions): Mesh {
    const mesh = new MeshImpl(this.#gl, options, this);
    this.#resources.add(mesh);
    return mesh;
  }

  render(options: RenderOptions): void {
    if (!this.#resources.has(options.shader)) {
      throw new Error("The specified shader was not created by this engine.");
    }

    if (
      options.frameBuffer !== undefined &&
      !this.#resources.has(options.frameBuffer)
    ) {
      throw new Error(
        "The specified framebuffer was not created by this engine.",
      );
    }

    const shader = options.shader as ShaderImpl;
    const frameBuffer = options.frameBuffer as FrameBufferImpl | undefined;
    const mesh = (options.mesh ?? this.#defaultMesh) as MeshImpl;
    if (!this.#resources.has(mesh)) {
      throw new Error("The specified mesh was not created by this engine.");
    }

    shader._use();

    if (frameBuffer) {
      frameBuffer._bind();
    } else {
      this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, null);
    }

    this.#gl.viewport(0, 0, this.#width, this.#height);

    this.clear();
    mesh._bind();
    if (mesh.indexCount > 0) {
      this.#gl.drawElements(
        this.#gl.TRIANGLES,
        mesh.indexCount,
        this.#gl.UNSIGNED_SHORT,
        0,
      );
    } else {
      this.#gl.drawArrays(this.#gl.TRIANGLES, 0, mesh.vertexCount);
    }

    if (frameBuffer) {
      frameBuffer._unbind();
    }
  }

  swapBuffers(): Promise<void> {
    // swap front and back buffer
    // throw new Error("TODO: Not implemented");
    this.#time = (performance.now() - this.#startTime) * 1e-3;
    return new Promise((res) => requestAnimationFrame(() => res()));
  }

  dispose(): void {
    this.#resources.forEach((resource) => {
      resource.dispose();
    });
    this.#resources.clear();
    this.#running = false;
  }

  isRunning(): boolean {
    return this.#running;
  }

  get time(): number {
    return this.#time;
  }

  get width(): number {
    return this.#width;
  }

  get height(): number {
    return this.#height;
  }
}

const defaultVertexShader = `#version 300 es

in vec2 a_Position;

void main(void) {
  gl_Position = vec4(a_Position, 0.0, 1.0);
}
`;

const defaultMesh: MeshOptions = {
  vertices: new Float32Array([
    -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0,
  ]),
  layout: [{ name: "a_Position", type: AttributeType.Vec2 }],
};
