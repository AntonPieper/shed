export interface Disposable {
  dispose(): void;
}

export interface DisposableManager {
  manageResource(resource: Disposable): void;
  disposeResource(resource: Disposable): boolean;
}

export type MouseInfo = {
  isPressed: boolean;
  x: number;
  y: number;
};

export interface ProvidersMap {
  accelorometer: DataProvider<number[]>;
  /** increments whenever update is called */
  counter: DataProvider<number>;
  /** Updates the time whenever update is called */
  time: DataProvider<number>;
  /** Updates mouse position whenever update is called */
  mouse: DataProvider<MouseInfo>;
}

export interface ShaderEngine extends Disposable, DisposableManager {
  initProvider<T extends keyof ProvidersMap>(type: T): ProvidersMap[T];
  clear(): void;
  createShader(fragment: string, vertex?: string): Shader;
  createFrameBuffer(scale: number): FrameBuffer;
  createTexture(width: number, height: number): Texture;
  createMesh(options: MeshOptions): Mesh;
  render(options: RenderOptions): void;
  swapBuffers(): Promise<void>;
  isRunning(): boolean;
  readonly time: number;
  readonly width: number;
  readonly height: number;
}

export interface DataProvider<T> extends Disposable {
  getData(): T;
  update(): void;
}

export type RenderOptions = {
  shader: Shader;
  frameBuffer?: FrameBuffer;
  mesh?: Mesh;
};

export type MeshOptions = {
  vertices: ArrayBuffer;
  indices?: Uint16Array;
  layout: AttributeLayout[];
};

export interface Mesh extends Disposable {
  readonly vertexCount: number;
  readonly indexCount: number;
}

export const AttributeType = {
  Float: "float",
  Vec2: "vec2",
  Vec3: "vec3",
  Vec4: "vec4",
  Int: "int",
  IVec2: "ivec2",
  IVec3: "ivec3",
  IVec4: "ivec4",
} as const;

export type AttributeType = (typeof AttributeType)[keyof typeof AttributeType];

export interface AttributeLayout {
  name: string;
  type: AttributeType;
  location?: number;
}

export interface Shader extends Disposable {
  setInt(name: string, ...data: number[]): void;
  setInt2(name: string, ...data: number[]): void;
  setInt3(name: string, ...data: number[]): void;
  setInt4(name: string, ...data: number[]): void;
  setFloat(name: string, ...data: number[]): void;
  setFloat2(name: string, ...data: number[]): void;
  setFloat3(name: string, ...data: number[]): void;
  setFloat4(name: string, ...data: number[]): void;
  setTexture(name: string, ...data: Texture[]): void;
  readonly uniformNames: Iterable<string>;
}

export interface FrameBuffer extends Disposable {
  getTexture(index?: number): Texture;
  addColorAttachment(texture: Texture): void;
}

export interface Texture extends Disposable {}
