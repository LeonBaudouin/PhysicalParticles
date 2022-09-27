export default function copyWorldMatrix(from: THREE.Object3D, to: THREE.Object3D) {
  from.updateMatrixWorld()
  from.getWorldPosition(to.position)
  from.getWorldQuaternion(to.quaternion)
  from.getWorldScale(to.scale)
}
