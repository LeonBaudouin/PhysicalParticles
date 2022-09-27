import * as THREE from 'three'
import { WebGLRenderTarget } from 'three'
import { ButtonApi, FolderApi } from 'tweakpane'
import reactiveUniforms from '~~/utils/uniforms/reactiveUniforms'
import AbstractObject from '~~/webgl/abstract/AbstractObject'
import { extendContext } from '~~/webgl/abstract/Context'
import fragmentShader from './index.frag'
import vertexShader from './index.vert'

export type RenderTargetDebuggerParams = {
  position?: THREE.Vector2
  scale?: number
  boost?: number
  toSrgb?: boolean
}

export type RenderTargetDebuggerData = Required<RenderTargetDebuggerParams>

export default class RenderTargetDebugger extends AbstractObject<
  any, // any to avoid circular reference
  // TODO : fix it
  THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>
> {
  private renderTarget: THREE.WebGLRenderTarget | null = null
  private uselessCamera: THREE.Camera = new THREE.OrthographicCamera()
  private map = new Map<string, { renderTarget: WebGLRenderTarget; button: ButtonApi }>()
  private renderTargetList: FolderApi
  private defaultName: string | null

  static DEFAULT_PARAMS: RenderTargetDebuggerParams = {
    position: new THREE.Vector2(-0.6, 0.38),
    scale: 0.5,
    boost: 1,
    toSrgb: false,
  }

  constructor(
    context: any,
    { name, ...params }: RenderTargetDebuggerParams & { name: string | null } = {
      ...RenderTargetDebugger.DEFAULT_PARAMS,
      name: null,
    }
  ) {
    super(
      extendContext(context, {
        tweakpane: context.tweakpane.addFolder({ title: 'RenderTargetDebugger', expanded: false, index: 1 }),
      })
    )

    this.defaultName = name

    Object.assign(params, { ...RenderTargetDebugger.DEFAULT_PARAMS, ...params })
    const data = (isReactive(params) ? params : reactive(params)) as RenderTargetDebuggerData

    this.object = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(1, 1),
      new THREE.ShaderMaterial({
        fragmentShader,
        vertexShader,
        uniforms: {
          uTexture: { value: null },
          uResolution: { value: this.context.state.pixelSize },
          uScale: { value: 1 },
          uBoost: { value: 1 },
          uPosition: { value: new THREE.Vector2() },
          uToSrgb: { value: false },
        },
        depthTest: false,
      })
    )

    reactiveUniforms(this.object.material.uniforms, data)

    this.object.frustumCulled = false

    this.context.tweakpane.addInput(data, 'position', {
      step: 0.01,
      x: { min: -1, max: 1 },
      y: { min: -1, max: 1 },
      min: -1,
      max: 1,
    })
    this.context.tweakpane.addInput(data, 'scale')
    this.context.tweakpane.addInput(data, 'boost')
    this.context.tweakpane.addInput(data, 'toSrgb')
    this.renderTargetList = this.context.tweakpane.addFolder({ title: 'List' })
    this.renderTargetList.addButton({ title: 'None' }).on('click', () => (this.renderTarget = null))
  }

  public registerRenderTarget(name: string, renderTarget: THREE.WebGLRenderTarget) {
    const button = this.renderTargetList
      .addButton({ title: name })
      .on('click', () => (this.renderTarget = renderTarget))
    if (name === this.defaultName) this.renderTarget = renderTarget
    this.map.set(name, { renderTarget, button })
  }
  public unregisterRenderTarget(name: string) {
    const entry = this.map.get(name)
    if (!entry) return
    entry.button.dispose()
    this.map.delete(name)
  }

  public tick() {
    if (this.object.visible && this.renderTarget) {
      this.context.renderer.autoClear = false
      this.object.material.uniforms.uTexture.value = this.renderTarget.texture
      this.context.renderer.render(this.object, this.uselessCamera)
      this.context.renderer.autoClear = true
    }
  }
}
