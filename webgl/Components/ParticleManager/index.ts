import * as THREE from 'three'
import { WebGLAppContext } from '~~/webgl'
import AbstractObject from '~~/webgl/abstract/AbstractObject'
import { extendContext } from '~~/webgl/abstract/Context'
import Particles, { ParticleSystemParams } from '../Particles'
import AbstractBehaviour from './Behaviour/AbstractBehaviour'
import FollowMouse from './Behaviour/FollowMouse'
import Rotation from './Behaviour/Rotation'
import Shapes from './Behaviour/Shapes'
import matcap from '/assets/particle_matcap.png'

const behaviours = {
  null: null,
  FollowMouse,
  Rotation,
  Shapes,
}

export default class ParticleManager extends AbstractObject {
  private particles: Particles

  private behaviour: AbstractBehaviour

  private particlesParams = reactive<Required<ParticleSystemParams>>({
    run: true,
    useTexture: false,
    rotateAround: true,
    fixOnAttractor: false,
    attractor: new THREE.Vector3(-1.18, 0, 0),
    G: 10,
    inertia: { min: 0.5, max: 0.903 },
    forceCap: { min: 0.07, max: 0.1 },
    gravity: new THREE.Vector3(0.005, 0.002, 0),
    rotationStrength: new THREE.Vector2(-0.004, 0.015),
    rotationDirection: new THREE.Euler(0.85, 0.01, 0),
    matcap: new URL(matcap, import.meta.url).href,
    size: 0.5,
    sizeVariation: new THREE.Vector4(0.09, 0.28, 0, 1),
    textureSize: new THREE.Vector2(128, 128),
    attractorsTexture: null,
  })

  constructor(context: WebGLAppContext, { behaviour = 'null' }: { behaviour?: keyof typeof behaviours }) {
    super(
      extendContext(context, { tweakpane: context.tweakpane.addFolder({ title: 'Particle Manager', expanded: false }) })
    )

    const behaviourName = ref<keyof typeof behaviours>(behaviour)

    this.context.tweakpane.addInput(behaviourName, 'value', {
      label: 'Particles Behaviour',
      options: Object.entries(behaviours).map(([key]) => ({ text: key, value: key })),
    })
    const button = this.context.tweakpane.addButton({ title: 'Log Params' })

    button.on('click', () => {
      console.log(JSON.parse(JSON.stringify(this.particlesParams)))
    })

    watch(
      behaviourName,
      (b) => {
        this.behaviour?.destroy()
        const behaviour = behaviours[b]
        if (!behaviour) return
        this.behaviour = new behaviour({ ...this.context, particleParams: this.particlesParams })
        // this.context.nuxtApp.$tweakpane.refresh()
      },
      { immediate: true }
    )

    this.particles = new Particles(this.context, this.particlesParams)
    this.object = this.particles.object
  }

  public tick(time: number, delta: number): void {
    this.behaviour?.tick(time, delta)
    this.particles.tick(time, delta)
  }
}
