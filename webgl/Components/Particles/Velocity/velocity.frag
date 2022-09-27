varying vec2 vUv;
uniform sampler2D uFbo;
uniform sampler2D uPositionFbo;
uniform sampler2D uRandomForces;
uniform sampler2D uAttractorsTexture;
uniform vec3 uAttractor;
uniform bool uUseTexture;
uniform bool uRotateAround;
uniform bool uFixOnAttractor;
uniform bool uUseSelection;
uniform float uG;
uniform vec2 uInertia;
uniform vec2 uRotationStrength;
uniform vec3 uRotationDirection;
uniform vec3 uGravity;
uniform vec2 uForceCap;

float rand(vec2 co) {
  return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

float remap(float value, float start1, float stop1, float start2, float stop2) {
  return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

float cremap(float value, float start1, float stop1, float start2, float stop2) {
  float r = remap(value, start1, stop1, start2, stop2);
  return clamp(r, min(start2, stop2), max(start2, stop2));
}

mat3 rotateY(float theta) {
  return mat3(cos(theta), 0., sin(theta), 0., 1., 0., - sin(theta), 0., cos(theta));
}


void main() {
  vec4 positionData = texture2D(uPositionFbo, vUv);
  vec4 inputData = texture2D(uFbo, vUv);
  vec4 baseData = inputData;
  vec3 randomForce = texture2D(uRandomForces, vUv).xyz;

  vec3 position = positionData.xyz;

  bool useTexture = uUseTexture;

  bool textureAttractors = useTexture;
  // ------ TEXTURE ATTRACTOR
  vec3 attractor = textureAttractors ? texture2D(uAttractorsTexture, vec2(rand(vUv), rand(vUv + 0.2))).xyz : uAttractor;

  bool selection = gl_FragCoord.x < 1. && gl_FragCoord.y < 5.;
  if (! selection && uUseSelection)
    attractor = vec3(0., 11., 0.);

  // ------ ATTRACTION
  if (length(position - attractor) == 0.)
    attractor.x += 0.1;
  float dist = length(position - attractor);
  float gDist = max(dist - 0.1, 0.);

  float G = uG;
  float force = G * ((0.001 + rand(vUv) * 100.) / (gDist * 0.01));
  // force = min(force, 0.01);
  force = min(force, uForceCap.y * 0.1);

  vec3 dir = normalize(attractor - position);
  inputData.xyz += force * dir;
  inputData.xyz += randomForce * remap(rand(vUv + 1.5), 0., 1., 0.2, 1.2);
  inputData.xyz += uGravity;

  bool rotateAround = uRotateAround && ! uFixOnAttractor;
  // ------ ROTATE AROUND
  if (rotateAround) {
    float side = sign(rand(vUv + 10.) - 0.5);
    vec3 rotateDir = rotateY(side * - 0.3) * uRotationDirection;
    vec3 rotateVelocity = cross(normalize(- rotateDir),
      // normalize(-vec3(1., side * -0.3, 0.5)),
    normalize(attractor - position));

    inputData.xyz += rotateVelocity * remap(rand(vUv + 1.1), 0., 1., uRotationStrength.x, uRotationStrength.y) // Random strength
    * cremap(dist, 0.5, 2., 2., 0.25) // Strength from distance
    * remap(side, - 1., 1., .5, .4); // Split strength between the two groups
  }

  float amount = length(inputData.xyz);
  vec3 velocity = normalize(inputData.xyz);

  float forceCap = uForceCap.x;
  // ------ CAP FORCE
  float minForce = uFixOnAttractor ? 0. : remap(rand(vUv + 1.), 0., 1., forceCap - 0.02, forceCap + 0.02);
  amount = max(amount * 0.98, minForce);

  bool fixOnAttractor = uFixOnAttractor;
  if (fixOnAttractor) {
    // velocity = mix(velocity, dir, cremap(dist, 0., 5., 1., 0.1));
    velocity = dir;
    amount = min(amount, dist);
    if (dist < 0.01)
      amount = 0.;
  }

  inputData.xyz = velocity * amount;

  float inertia = uFixOnAttractor ? 0. : remap(rand(vUv + 10.), 0., 1., uInertia.x, uInertia.y);

  gl_FragColor = mix(inputData, baseData, inertia);
}
