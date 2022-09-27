import { WebGLAppContext } from '~~/webgl'
import * as THREE from 'three'
import fragmentShader from './index.frag'
import vertexShader from './index.vert'

export default class NoiseGenerator {
  private context: WebGLAppContext
  private quad: THREE.Mesh
  private camera = new THREE.PerspectiveCamera()
  private material: THREE.ShaderMaterial
  private renderTargets = new Map<string, THREE.WebGLRenderTarget>()

  constructor(context: WebGLAppContext) {
    this.context = context

    this.material = new THREE.ShaderMaterial({
      uniforms: { uNoiseScale: { value: 4 }, uOctave: { value: 20 } },
      fragmentShader,
      vertexShader,
      depthTest: false,
    })

    this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), this.material)
    this.quad.renderOrder = -100
    this.quad.frustumCulled = false
  }

  public getRenderTarget(id: string) {
    if (!this.renderTargets.has(id)) {
      const renderTarget = new THREE.WebGLRenderTarget(0, 0, { depthBuffer: false, stencilBuffer: false })
      this.context.renderTargetDebugger.registerRenderTarget(id, renderTarget)
      this.renderTargets.set(id, renderTarget)
    }
    return this.renderTargets.get(id)!
  }

  public render(
    id: string,
    {
      size = { x: 1024, y: 1024 },
      noiseScale = 4,
      octave = 20,
      force = true,
    }: { size?: { x: number; y: number }; noiseScale?: number; octave?: number; force?: boolean } = {}
  ) {
    const alreadyExist = this.renderTargets.has(id)
    const renderTarget = this.getRenderTarget(id)
    if (alreadyExist && !force) return renderTarget.texture
    this.material.uniforms.uNoiseScale.value = noiseScale
    this.material.uniforms.uOctave.value = octave
    renderTarget.setSize(size.x, size.y)
    const lastTarget = this.context.renderer.getRenderTarget()
    this.context.renderer.setRenderTarget(renderTarget)
    this.context.renderer.render(this.quad, this.camera)
    this.context.renderer.setRenderTarget(lastTarget)
    return renderTarget.texture
  }
}
