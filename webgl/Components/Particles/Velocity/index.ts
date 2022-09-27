import AbstractObject from '~~/webgl/abstract/AbstractObject'
import * as THREE from 'three'
import GPGPU from '~~/utils/GPGPU'
import vertex from '../default.vert'
import velocityFragment from './velocity.frag'
import { onSphere } from '~~/utils/math/onSphere'
import { WebGLAppContext } from '~~/webgl'
import AbstractComponent from '~~/webgl/abstract/AbstractComponent'
import reactiveUniforms, { CustomWatch } from '~~/utils/uniforms/reactiveUniforms'
import { extendContext } from '~~/webgl/abstract/Context'

export type VelocityParams = {
  useTexture?: boolean
  rotateAround?: boolean
  fixOnAttractor?: boolean
  G?: number
  inertia?: { min: number; max: number }
  forceCap?: { min: number; max: number }
  rotationStrength?: THREE.Vector2
  gravity?: THREE.Vector3
  rotationDirection?: THREE.Euler
  attractor?: THREE.Vector3
  textureSize: THREE.Vector2
  attractorsTexture?: THREE.Texture | null
}

export type VelocityData = Required<VelocityParams>

export default class Velocity extends AbstractComponent<WebGLAppContext> {
  private velocity: GPGPU

  public data: VelocityData

  public static DEFAULT_PARAMS: Omit<VelocityData, 'textureSize' | ''> = reactive({
    useTexture: false,
    rotateAround: true,
    fixOnAttractor: false,
    G: 10,
    inertia: { min: 0, max: 0.4 },
    forceCap: { min: 0.07, max: 0.1 },
    rotationStrength: new THREE.Vector2(0.02, 0.025),
    gravity: new THREE.Vector3(0, 0.001, 0.009),
    rotationDirection: new THREE.Euler(-1.96, 0.67, -0.15),
    attractor: new THREE.Vector3(0, 0, 0),
    attractorsTexture: null,
  })

  constructor(context: WebGLAppContext, params: VelocityParams) {
    super(extendContext(context, { tweakpane: context.tweakpane.addFolder({ title: 'Velocity' }) }))

    Object.assign(params, { ...Velocity.DEFAULT_PARAMS, ...params })
    this.data = (isReactive(params) ? params : reactive(params)) as VelocityData
    const velocityInitTexture = new THREE.DataTexture(
      new Float32Array(
        new Array(params.textureSize.x * params.textureSize.y * 4).fill(0).map(() => (Math.random() - 0.5) * 0.01)
      ),
      params.textureSize.x,
      params.textureSize.y,
      THREE.RGBAFormat,
      THREE.FloatType
    )
    velocityInitTexture.needsUpdate = true

    const randomForce = new Float32Array(new Array(params.textureSize.x * params.textureSize.y * 4))
    onSphere(randomForce, { center: [0, 0, 0], radius: 0.002 }, true)
    const randomForceTex = new THREE.DataTexture(
      randomForce,
      params.textureSize.x,
      params.textureSize.y,
      THREE.RGBAFormat,
      THREE.FloatType
    )
    randomForceTex.needsUpdate = true

    velocityInitTexture.needsUpdate = true
    const velocityShader = new THREE.ShaderMaterial({
      fragmentShader: velocityFragment,
      vertexShader: vertex,
      uniforms: {
        uFbo: { value: null },
        uPositionFbo: { value: null },
        uAttractorsTexture: { value: null },
        uAttractor: { value: new THREE.Vector3() },
        uRandomForces: { value: randomForceTex },
        uUseTexture: { value: false },
        uRotateAround: { value: true },
        uFixOnAttractor: { value: false },
        uUseSelection: { value: false },
        uG: { value: 1 },
        uInertia: { value: new THREE.Vector2() },
        uForceCap: { value: new THREE.Vector2() },
        uRotationStrength: { value: new THREE.Vector2() },
        uGravity: { value: new THREE.Vector3() },
        uRotationDirection: { value: new THREE.Vector3() },
        uTextureSize: { value: params.textureSize },
      },
    })

    const customRotationDirection: CustomWatch<THREE.Euler> = (uniform, object, key) => {
      let previousOnChange = object[key]._onChangeCallback
      uniform.value.set(0, 1, 0).applyEuler(object[key])
      object[key]._onChange(() => {
        previousOnChange()
        uniform.value.set(0, 1, 0).applyEuler(object[key])
      })
      return () => object[key]._onChange(previousOnChange)
    }

    reactiveUniforms(velocityShader.uniforms, this.data, {
      rotationDirection: customRotationDirection,
    })

    watchEffect(
      () =>
        (velocityShader.uniforms.uUseSelection.value = this.context.nuxtApp.$router.currentRoute.value.name === 'about')
    )

    this.context.tweakpane.addInput(this.data, 'useTexture', { label: 'Follow Texture' })
    this.context.tweakpane.addInput(this.data, 'rotateAround', { label: 'Rotate Around' })
    this.context.tweakpane.addInput(this.data, 'fixOnAttractor', { label: 'Fix On Attractor' })
    this.context.tweakpane.addInput(this.data, 'attractor', { label: 'Attractor' })
    this.context.tweakpane.addInput(this.data, 'G', { label: 'G' })
    this.context.tweakpane.addInput(this.data, 'inertia', { label: 'Inertia', min: 0, max: 1 })
    this.context.tweakpane.addInput(this.data, 'forceCap', { label: 'ForceCap', min: 0, max: 0.5 })
    this.context.tweakpane.addInput(this.data, 'gravity', {
      label: 'Gravity',
      x: { step: 0.001 },
      y: { step: 0.001 },
      z: { step: 0.001 },
    })
    this.context.tweakpane.addInput(this.data, 'rotationStrength', {
      label: 'Rotation Strength',
      x: { step: 0.001 },
      y: { step: 0.001 },
    })
    this.context.tweakpane.addInput(this.data, 'rotationDirection', {
      label: 'Rotation Direction',
      view: 'rotation',
      rotationMode: 'euler',
    })
    this.velocity = new GPGPU({
      size: params.textureSize,
      renderer: this.context.renderer,
      shader: velocityShader,
      initTexture: velocityInitTexture,
      renderTargetParams: { type: THREE.FloatType },
    })

    this.context.renderTargetDebugger.registerRenderTarget('velocity', this.velocity.getBuffer())
  }

  public updateTexture(tex: THREE.Texture) {
    this.velocity.quad!.material.uniforms.uPositionFbo.value = tex
  }

  public getTexture() {
    return this.velocity.outputTexture
  }

  public tick(time: number, delta: number): void {
    this.velocity.render()
  }
}
