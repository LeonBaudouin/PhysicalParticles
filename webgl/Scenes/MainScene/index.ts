import * as THREE from 'three'
import { WebGLAppContext } from '~/webgl'
import AbstractScene from '~~/webgl/abstract/AbstractScene'
import { extendContext } from '~~/webgl/abstract/Context'
import Background from '~~/webgl/Components/Background'
import DebugCamera from '~~/webgl/Components/Camera/DebugCamera'
import SimpleCamera from '~~/webgl/Components/Camera/SimpleCamera'
import ParticleManager from '~~/webgl/Components/ParticleManager'

export type MainSceneContext = WebGLAppContext & { scene: MainScene }

export default class MainScene extends AbstractScene<MainSceneContext, THREE.PerspectiveCamera> {
  private debugCamera: DebugCamera
  private mainCamera: SimpleCamera

  private particles: ParticleManager

  private sceneState = reactive({})

  private params = {
    debugCam: false,
  }

  constructor(context: WebGLAppContext) {
    super(extendContext(context, { scene: () => this }))

    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0xe5e0de)

    this.debugCamera = new DebugCamera(this.context, { defaultPosition: new THREE.Vector3(0, 0, 30) })
    this.scene.add(this.debugCamera.object)

    this.mainCamera = new SimpleCamera(this.context, { defaultPosition: new THREE.Vector3(0, 0, 30) })
    this.scene.add(this.mainCamera.object)

    this.camera = this.params.debugCam ? this.debugCamera.object : this.mainCamera.object

    this.context.tweakpane
      .addInput(this.params, 'debugCam', { label: 'Debug Cam' })
      .on('change', ({ value }) => (this.camera = value ? this.debugCamera.object : this.mainCamera.object))

    this.setObjects()
  }

  private setObjects() {
    this.particles = new ParticleManager(this.context, { behaviour: 'null' })
    this.scene.add(this.particles.object)

    const background = new Background(this.context)
    this.scene.add(background.object)
  }

  public tick(time: number, delta: number): void {
    this.debugCamera.tick(time, delta)
    this.particles.tick(time, delta)
  }
}
