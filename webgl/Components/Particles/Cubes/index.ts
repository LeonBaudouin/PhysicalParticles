import AbstractObject from '~~/webgl/abstract/AbstractObject'
import * as THREE from 'three'
import particlesFragment from './particles.frag'
import particlesVertex from './particles.vert'
import { WebGLAppContext } from '~~/webgl'
import reactiveUniforms, { CustomWatch } from '~~/utils/uniforms/reactiveUniforms'
import matcap from '/assets/particle_matcap.png'

export type CubesParams = {
  sizeVariation?: THREE.Vector4
  size?: number
  textureSize: THREE.Vector2
  matcap?: string | HTMLImageElement | THREE.Texture
}

export type CubesData = Required<CubesParams>

export default class Cubes extends AbstractObject<
  WebGLAppContext,
  THREE.InstancedMesh<THREE.BufferGeometry, THREE.ShaderMaterial>
> {
  public data: CubesData

  public static DEFAULT_PARAMS: Omit<CubesData, 'textureSize'> = reactive({
    sizeVariation: new THREE.Vector4(0.07, 0.28, 0, 1),
    size: 0.5,
    matcap: `${location.origin}/${matcap}`,
    geometry: null,
  })

  constructor(context: WebGLAppContext, params: CubesParams) {
    super({ ...context, tweakpane: context.tweakpane.addFolder({ title: 'Mesh' }) })

    Object.assign(params, { ...Cubes.DEFAULT_PARAMS, ...params })
    this.data = (isReactive(params) ? params : reactive(params)) as CubesData

    const textureLoader = new THREE.TextureLoader()
    const mat = new THREE.ShaderMaterial({
      vertexShader: particlesVertex,
      fragmentShader: particlesFragment,
      side: THREE.BackSide,
      fog: true,
      uniforms: {
        uPosTexture: { value: null },
        uPreviousPosTexture: { value: null },
        uVelocityTexture: { value: null },
        uMatcap: { value: null },
        uSize: { value: 0 },
        uSizeVariation: { value: new THREE.Vector4() },
        ...THREE.UniformsLib['fog'],
        ...this.context.globalUniforms,
      },
    })

    const textureWatch: CustomWatch<string | HTMLImageElement | THREE.Texture> = (uniform, object, key) =>
      watchEffect(() => {
        const value = object[key]
        if (typeof value == 'string')
          uniform.value = textureLoader.load(value, (t) => (t.encoding = THREE.LinearEncoding))
        if (typeof value == 'object' && 'isTexture' in value) uniform.value = value
        if (typeof value == 'object' && 'src' in value)
          uniform.value = textureLoader.load(value.src, (t) => (t.encoding = THREE.LinearEncoding))
      })
    reactiveUniforms(mat.uniforms, this.data, {
      matcap: textureWatch,
    })

    this.context.tweakpane.addInput(this.data, 'matcap', { label: 'Matcap', view: 'input-image', imageFit: 'contain' })

    this.context.tweakpane.addInput(this.data, 'size', { label: 'Size' })
    this.context.tweakpane.addInput(this.data, 'sizeVariation', { label: 'Size Variation' })

    const geometry = new THREE.InstancedBufferGeometry()

    geometry.instanceCount = params.textureSize.x * params.textureSize.y

    const index = new Float32Array(params.textureSize.x * params.textureSize.y)

    for (let i = 0; i < params.textureSize.x * params.textureSize.y; i++) index[i] = i
    geometry.setAttribute('aIndex', new THREE.InstancedBufferAttribute(index, 1, false))

    const pixelPos = new Float32Array(params.textureSize.x * params.textureSize.y * 2)
    for (let i = 0; i < params.textureSize.x * params.textureSize.y; i++) {
      pixelPos[i * 2] = (i % params.textureSize.x) / params.textureSize.x
      pixelPos[i * 2 + 1] = Math.floor(i / params.textureSize.x) / params.textureSize.y
    }
    geometry.setAttribute('aPixelPosition', new THREE.InstancedBufferAttribute(pixelPos, 2, false))

    this.object = new THREE.InstancedMesh(geometry, mat, 16384 || params.textureSize.x * params.textureSize.y)

    // Watch expression just in case
    const geom = new THREE.BoxBufferGeometry()
    watch(
      () => geom,
      (g) => {
        if (g === null) return
        const origGeometry = g
        Object.keys(origGeometry.attributes).forEach((attributeName) => {
          geometry.attributes[attributeName] = origGeometry.attributes[attributeName]
        })
        geometry.index = origGeometry.index
      },
      { immediate: true }
    )
    // --

    this.context.tweakpane.addInput(this.object, 'count', {
      label: 'Amount',
      min: 0,
      max: params.textureSize.x * params.textureSize.y,
      step: 1,
    })
  }

  public setTextures(
    positionTexture: THREE.Texture,
    previousPositionTexture: THREE.Texture,
    velocityTexture: THREE.Texture
  ): void {
    this.object.material.uniforms.uPosTexture.value = positionTexture
    this.object.material.uniforms.uPreviousPosTexture.value = previousPositionTexture
    this.object.material.uniforms.uVelocityTexture.value = velocityTexture
  }
}
