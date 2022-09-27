import { MainSceneContext } from '~~/webgl/Scenes/MainScene'
import AbstractBehaviour, { BehaviourContext } from './AbstractBehaviour'
import * as THREE from 'three'
import pixelToScreenCoords from '~~/utils/webgl/pixelToScreenCoords'

export default class FollowMouse extends AbstractBehaviour {
  protected declare context: MainSceneContext & BehaviourContext
  constructor(context: BehaviourContext) {
    super(context)

    const lastAttractor = this.context.particleParams.attractor.clone()

    const raycaster = new THREE.Raycaster()
    const onMouseMove = (e: MouseEvent) => {
      raycaster.setFromCamera(pixelToScreenCoords(e.clientX, e.clientY), this.context.scene.camera)
      raycaster.ray.at(30, this.context.particleParams.attractor)
    }

    window.addEventListener('mousemove', onMouseMove)
    this.toUnbind(() => {
      window.removeEventListener('mousemove', onMouseMove)
      this.context.particleParams.attractor.copy(lastAttractor)
    })
  }
}
