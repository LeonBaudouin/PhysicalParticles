import AbstractObject from '~~/webgl/abstract/AbstractObject'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as THREE from 'three'
import { WebGLAppContext } from '~~/webgl'

export default class DebugCamera extends AbstractObject<WebGLAppContext, THREE.PerspectiveCamera> {
  public controls: OrbitControls

  constructor(context: WebGLAppContext, { defaultPosition }: { defaultPosition: THREE.Vector3 }) {
    super(context)
    this.object = new THREE.PerspectiveCamera(30.0, window.innerWidth / window.innerHeight, 0.1, 1000)
    this.object.position.copy(defaultPosition)

    this.controls = new OrbitControls(this.object, this.context.renderer.domElement)
    this.controls.enableDamping = true

    window.addEventListener('resize', this.onResize, { passive: true })

    this.onResize()
  }

  private onResize = () => {
    this.object.aspect = window.innerWidth / window.innerHeight
    this.object.updateProjectionMatrix()
  }

  public tick(time: number, delta: number): void {
    this.controls.update()
  }
}
