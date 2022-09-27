varying vec2 vUv;
uniform vec2 uResolution;
uniform float uScale;
uniform vec2 uPosition;

void main() {
  float ratio = (uResolution.x / uResolution.y);
  vec2 newPosition = position.xy;


  newPosition -= 0.5;
  newPosition.y *= ratio;
  newPosition += vec2(0.5, 0.5 * ratio);
  newPosition *= uScale;

  vec2 offset = uPosition;
  offset.y *= -1.;
  newPosition += offset;

  gl_Position = vec4(newPosition.xy, 1.0, 1.0);
  vUv = uv;
}
