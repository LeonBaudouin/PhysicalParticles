varying vec2 vUv;
uniform sampler2D uTexture;
uniform float uBoost;
uniform bool uToSrgb;

void main() {
  gl_FragColor = vec4(texture2D(uTexture, vUv).rgb * uBoost, 1.);
  if (uToSrgb) gl_FragColor = LinearTosRGB(gl_FragColor);
}
