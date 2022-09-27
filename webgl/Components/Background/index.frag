#include /math/random.glsl

varying vec3 vEyeDirection;

void main() {
  vec3 dir = normalize(vEyeDirection);
  float ground = dot(dir, vec3(0., - 1, 0.));
  ground = smoothstep(0., 0.3, ground);
  ground += (random(gl_FragCoord.xy) - 0.5) * 0.2;
  vec3 color = mix(vec3(.1, .1, .1), vec3(.2, .2, .2), ground);
  gl_FragColor = vec4(color, 1.);
}
