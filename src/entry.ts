import { ShaderEngineImpl } from "./webgl";

const engine = new ShaderEngineImpl(
  document.getElementById("canvas") as HTMLCanvasElement,
);

export default engine;
