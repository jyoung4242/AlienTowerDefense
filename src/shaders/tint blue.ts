export const tintShader = `#version 300 es
precision mediump float;

uniform sampler2D u_graphic;

in vec2 v_uv;
out vec4 fragColor;


void main() {
  // Overlay original texture
  vec4 originalColor = texture(u_graphic, v_uv);
  fragColor = originalColor;
  if (originalColor.a > 0.) {
    fragColor = mix(originalColor, vec4(0.,0.,1.,1.), .5);
  }
  fragColor.rgb = fragColor.rgb * fragColor.a;
}
`;
