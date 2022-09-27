import * as THREE from 'three'
import findOrthonormals from './findOrthonormals'

const flattened = new THREE.Vector3()
const transformed = new THREE.Vector3()
const axisVector = new THREE.Vector3()
const orthonormal1 = new THREE.Vector3()
const orthonormal2 = new THREE.Vector3()

export default function getRotationComponentAboutAxis(q: THREE.Quaternion, axis: THREE.Vector3) {
  axisVector.copy(axis).normalize()

  // Get the plane the axis is a normal of
  findOrthonormals(axis, orthonormal1, orthonormal2)

  transformed.copy(orthonormal1).applyQuaternion(q)

  // Project transformed vector onto plane
  flattened.subVectors(transformed, axisVector.multiplyScalar(transformed.dot(axisVector)))
  flattened.normalize()

  // Get angle between original vector and projected transform to get angle around normal
  return Math.acos(orthonormal1.dot(flattened))
}
