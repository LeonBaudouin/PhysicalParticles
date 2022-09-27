// https://stackoverflow.com/questions/60132588/i-need-help-converting-this-2d-sky-shader-to-3d
vec4 eyeDirection() {
  vec3 proj_ray = vec3(inverse(projectionMatrix) * vec4(position.xyz, 1.0));
  return (inverse(viewMatrix) * vec4(proj_ray.xyz, 0.0));
}
