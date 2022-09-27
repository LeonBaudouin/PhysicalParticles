uniform sampler2D uMatcap;
uniform bool uInReflection;

varying vec3 vViewPosition;
varying vec3 vNormal;
varying vec2 vUv;

#include <fog_pars_fragment>


float remap(float value, float start1, float stop1, float start2, float stop2)
{
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

float cremap(float value, float start1, float stop1, float start2, float stop2) {
    float r = remap(value, start1, stop1, start2, stop2);
    return clamp(r, start2, stop2);
}

void main() {
	vec3 normal = normalize( vNormal );

	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 matcapUv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
  if (uInReflection) matcapUv.x = 1. - matcapUv.x;

  vec3 color = texture2D(uMatcap, matcapUv).rgb;

  gl_FragColor = vec4(color, 1.);

  #include <fog_fragment>
  gl_FragColor = linearToOutputTexel( gl_FragColor );
}
