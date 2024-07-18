import engine from "./shader-engine";

const shader = engine.createShader(`#version 300 es
precision mediump float;

uniform float u_Value;

out vec4 fragColor;

void main(void) {
  fragColor = vec4(vec3(u_Value % 1.0), 1.0);
}
`);

while (engine.isRunning()) {
  shader.setFloat("u_Value", engine.time % 1);
  engine.render({ shader });
  await engine.swapBuffers();
}

// Dispose of engine and all resources when done
engine.dispose();
