import { ShaderEngineImpl } from ".";
import { AttributeType, Mesh, MeshOptions } from "../shader-engine";

export class MeshImpl implements Mesh {
  #gl: WebGL2RenderingContext;
  #vao: WebGLVertexArrayObject;
  #vertexBuffer: WebGLBuffer;
  #indexBuffer: WebGLBuffer | null;
  #vertexCount: number;
  #indexCount: number;
  #engine: ShaderEngineImpl;

  constructor(
    gl: WebGL2RenderingContext,
    { vertices, indices, layout }: MeshOptions,
    engine: ShaderEngineImpl,
  ) {
    this.#gl = gl;
    this.#engine = engine;

    // Create VAO
    this.#vao = gl.createVertexArray()!;
    gl.bindVertexArray(this.#vao);

    // Create vertex buffer
    this.#vertexBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.#vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // Set up attribute pointers
    let stride = layout.reduce(
      (acc, attr) => acc + getAttributeSize(attr.type),
      0,
    );

    let offset = 0;
    layout.forEach((attr, index) => {
      const location = attr.location ?? index;
      const size = getAttributeSize(attr.type) / 4;
      const type = getGLType(attr.type, gl);

      gl.enableVertexAttribArray(location);
      if (isIntegerType(attr.type)) {
        gl.vertexAttribIPointer(location, size, type, stride, offset);
      } else {
        gl.vertexAttribPointer(location, size, type, false, stride, offset);
      }
      offset += getAttributeSize(attr.type);
    });

    if (indices) {
      // Create index buffer
      this.#indexBuffer = gl.createBuffer()!;
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.#indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
      this.#indexCount = indices.length;
    } else {
      this.#indexBuffer = null;
      this.#indexCount = 0;
    }

    this.#vertexCount = vertices.byteLength / stride; // Assuming each vertex has stride bytes
    gl.bindVertexArray(null);
  }

  _bind(): void {
    this.#gl.bindVertexArray(this.#vao);
  }

  dispose(): void {
    if (this.#engine.disposeResource(this)) {
      this.#gl.deleteVertexArray(this.#vao);
      this.#gl.deleteBuffer(this.#vertexBuffer);
      if (this.#indexBuffer) {
        this.#gl.deleteBuffer(this.#indexBuffer);
      }
    }
  }

  get vertexCount(): number {
    return this.#vertexCount;
  }

  get indexCount(): number {
    return this.#indexCount;
  }
}

function getAttributeSize(type: AttributeType): number {
  switch (type) {
    case AttributeType.Float:
    case AttributeType.Int:
      return 1 * 4;
    case AttributeType.Vec2:
    case AttributeType.IVec2:
      return 2 * 4;
    case AttributeType.Vec3:
    case AttributeType.IVec3:
      return 3 * 4;
    case AttributeType.Vec4:
    case AttributeType.IVec4:
      return 4 * 4;
    default:
      throw new Error("Unsupported attribute type");
  }
}

function getGLType(type: AttributeType, gl: WebGLRenderingContext): number {
  switch (type) {
    case AttributeType.Float:
    case AttributeType.Vec2:
    case AttributeType.Vec3:
    case AttributeType.Vec4:
      return gl.FLOAT;
    case AttributeType.Int:
    case AttributeType.IVec2:
    case AttributeType.IVec3:
    case AttributeType.IVec4:
      return gl.INT;
    default:
      throw new Error("Unsupported attribute type");
  }
}

function isIntegerType(type: AttributeType): boolean {
  switch (type) {
    case AttributeType.Int:
    case AttributeType.IVec2:
    case AttributeType.IVec3:
    case AttributeType.IVec4:
      return true;
    default:
      return false;
  }
}
