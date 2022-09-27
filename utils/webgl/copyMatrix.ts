export default function copyMatrix(from: THREE.Object3D, to: THREE.Object3D) {
  to.position.copy(from.position)
  to.rotation.copy(from.rotation)
  to.scale.copy(from.scale)
}
