varying vec3 vEyeDirection;

#include /eyeDirection.glsl

void main() {
  gl_Position = vec4(position, 1.);
  vEyeDirection = eyeDirection().xyz;
}
