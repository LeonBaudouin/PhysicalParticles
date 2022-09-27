import AbstractObject from '~~/webgl/abstract/AbstractObject'
import * as THREE from 'three'
import { WebGLAppContext } from '~~/webgl'

export default class SimpleCamera extends AbstractObject<WebGLAppContext, THREE.PerspectiveCamera> {
  constructor(
    context: WebGLAppContext,
    { defaultPosition, defaultRotation }: { defaultPosition?: THREE.Vector3; defaultRotation?: THREE.Euler }
  ) {
    super(context)
    this.object = new THREE.PerspectiveCamera(26.6, window.innerWidth / window.innerHeight, 0.1, 1000)
    if (defaultPosition) this.object.position.copy(defaultPosition)
    if (defaultRotation) this.object.rotation.copy(defaultRotation)

    window.addEventListener('resize', this.onResize)

    this.onResize()
  }

  private onResize = () => {
    this.object.aspect = window.innerWidth / window.innerHeight
    this.object.updateProjectionMatrix()
  }
}
