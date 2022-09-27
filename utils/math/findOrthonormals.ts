import * as THREE from 'three'
import { degToRad } from 'three/src/math/MathUtils'

const orthoX = new THREE.Matrix4().makeRotationX(degToRad(90))
const orthoY = new THREE.Matrix4().makeRotationY(degToRad(90))
const temp1 = new THREE.Vector3()

export default function findOrthonormals(
  normal: THREE.Vector3,
  orthonormal1: THREE.Vector3,
  orthonormal2: THREE.Vector3
) {
  let w = temp1.copy(normal).transformDirection(orthoX)
  const dot = normal.dot(w)
  if (Math.abs(dot) > 0.6) {
    w = temp1.copy(normal).transformDirection(orthoY)
  }
  w.normalize()

  orthonormal1.crossVectors(normal, w)
  orthonormal1.normalize()
  orthonormal2.crossVectors(normal, orthonormal1)
  orthonormal2.normalize()
}
