attribute vec2 aPixelPosition;

uniform sampler2D uPosTexture;
uniform sampler2D uPreviousPosTexture;
uniform sampler2D uVelocityTexture;
uniform float uSize;
uniform vec4 uSizeVariation;

varying vec3 vViewPosition;
varying vec3 vNormal;
varying vec2 vUv;

#include <fog_pars_vertex>

mat3 calcLookAtMatrix(vec3 origin, vec3 target, float roll) {
	vec3 rr = vec3(sin(roll), cos(roll), 0.0);
	vec3 ww = normalize(target - origin);
	vec3 uu = normalize(cross(ww, rr));
	vec3 vv = normalize(cross(uu, ww));

	return mat3(uu, vv, ww);
}

// ------------
// --- MATH ---
// ------------

float remap(float value, float start1, float stop1, float start2, float stop2) {
  return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

float cremap(float value, float start1, float stop1, float start2, float stop2) {
  float r = remap(value, start1, stop1, start2, stop2);
  return clamp(r, min(start2, stop2), max(start2, stop2));
}

void main() {
  vec4 data = texture2D(uPosTexture, aPixelPosition);
  vec4 previousData = texture2D(uPreviousPosTexture, aPixelPosition);
  vec4 velocityData = texture2D(uVelocityTexture, aPixelPosition);
  float speed = length(velocityData.xyz);
  vec3 offset = data.rgb;

  float scale = cremap(
    speed,
    uSizeVariation.x,
    uSizeVariation.y,
    uSizeVariation.z,
    uSizeVariation.w
  ) * uSize;

  vec3 prevPos = previousData.xyz ;
	mat4 localRotation = mat4( calcLookAtMatrix( data.xyz, prevPos.xyz, 0. ) );
  vec3 newPosition = (localRotation * vec4(position, 1.0)).xyz;

  vNormal = normalMatrix * (localRotation * vec4(normal, 0.)).rgb;

  vec4 mvPosition = modelViewMatrix * vec4((newPosition * scale + offset), 1.0);

	vViewPosition = - mvPosition.xyz;

  vUv = uv;
  gl_Position = projectionMatrix * mvPosition;

	#include <fog_vertex>
}
