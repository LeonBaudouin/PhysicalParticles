export default function lerpVectors(from: THREE.Object3D, to: THREE.Object3D, alpha: number, target: THREE.Object3D) {
  target.position.lerpVectors(from.position, to.position, alpha)
  target.quaternion.slerpQuaternions(from.quaternion, to.quaternion, alpha)
  target.scale.lerpVectors(from.scale, to.scale, alpha)
}
