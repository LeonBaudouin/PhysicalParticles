import { MainSceneContext } from '~~/webgl/Scenes/MainScene'
import AbstractBehaviour, { BehaviourContext } from './AbstractBehaviour'
import * as THREE from 'three'
import pixelToScreenCoords from '~~/utils/webgl/pixelToScreenCoords'

import { createNoise3D } from 'simplex-noise'

const noise3D = createNoise3D()

function curlNoise(x, y, z, out = new THREE.Vector3()) {
  const eps = 1.0
  let n1, n2, a, b

  n1 = noise3D(x, y + eps, z)
  n2 = noise3D(x, y - eps, z)

  a = (n1 - n2) / (2 * eps)

  n1 = noise3D(x, y, z + eps)
  n2 = noise3D(x, y, z - eps)

  b = (n1 - n2) / (2 * eps)

  out.x = a - b

  n1 = noise3D(x, y, z + eps)
  n2 = noise3D(x, y, z - eps)

  a = (n1 - n2) / (2 * eps)

  n1 = noise3D(x + eps, y, z)
  n2 = noise3D(x + eps, y, z)

  b = (n1 - n2) / (2 * eps)

  out.y = a - b

  n1 = noise3D(x + eps, y, z)
  n2 = noise3D(x - eps, y, z)

  a = (n1 - n2) / (2 * eps)

  n1 = noise3D(x, y + eps, z)
  n2 = noise3D(x, y - eps, z)

  b = (n1 - n2) / (2 * eps)

  out.z = a - b

  return out
}

export default class Rotation extends AbstractBehaviour {
  protected declare context: MainSceneContext & BehaviourContext

  constructor(context: BehaviourContext) {
    super(context)
    const lastRotation = this.context.particleParams.rotationDirection.clone()
    const lastRotationStrength = this.context.particleParams.rotationStrength.clone()
    this.context.particleParams.rotationStrength.set(0.02, 0.042)

    const raycaster = new THREE.Raycaster()
    const quaternion = new THREE.Quaternion()
    const vector = new THREE.Vector3()

    const onMouseMove = (e: MouseEvent) => {
      raycaster.setFromCamera(pixelToScreenCoords(e.clientX, e.clientY), this.context.scene.camera)
      raycaster.ray.at(30, vector)
      vector.sub(this.context.particleParams.attractor)
      vector.normalize()
      quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, -1), vector)

      this.context.particleParams.rotationDirection.setFromQuaternion(quaternion)
    }

    window.addEventListener('mousemove', onMouseMove)
    this.toUnbind(() => {
      window.removeEventListener('mousemove', onMouseMove)
      this.context.particleParams.rotationDirection.copy(lastRotation)
      this.context.particleParams.rotationStrength.copy(lastRotationStrength)
    })
  }
}
