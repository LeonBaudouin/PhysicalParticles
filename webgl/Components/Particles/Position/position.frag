varying vec2 vUv;
uniform sampler2D uFbo;
uniform sampler2D uVelocityFbo;
uniform float uSpeed;
uniform float uDelta;

void main() {
  vec4 velocityData = texture2D(uVelocityFbo, vUv);
  vec4 inputData = texture2D(uFbo, vUv);
  inputData.xyz += velocityData.xyz * uSpeed * uDelta;
	gl_FragColor = inputData;
}
