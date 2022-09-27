import AbstractObject from '~~/webgl/abstract/AbstractObject'
import * as THREE from 'three'
import GPGPU from '~~/utils/GPGPU'
import vertex from '../default.vert'
import positionFragment from './position.frag'
import { inSphere } from '~~/utils/math/inSphere'
import { WebGLAppContext } from '~~/webgl'
import AbstractComponent from '~~/webgl/abstract/AbstractComponent'
import { isIOS } from '~~/utils/browser/isIOS'
import { extendContext } from '~~/webgl/abstract/Context'

export default class Position extends AbstractComponent<WebGLAppContext> {
  private position: GPGPU
  private positionShader: THREE.ShaderMaterial

  constructor(
    context: WebGLAppContext,
    { size, startPosition = new THREE.Vector3() }: { size: THREE.Vector2; startPosition?: THREE.Vector3 }
  ) {
    super(extendContext(context, { tweakpane: context.tweakpane.addFolder({ title: 'Position' }) }))

    const positionArray = new Float32Array(new Array(size.x * size.y * 4))
    inSphere(positionArray, { radius: 2, center: startPosition.toArray() }, true)
    const posInitTexture = new THREE.DataTexture(positionArray, size.x, size.y, THREE.RGBAFormat, THREE.FloatType)
    posInitTexture.needsUpdate = true

    this.positionShader = new THREE.ShaderMaterial({
      fragmentShader: positionFragment,
      vertexShader: vertex,
      uniforms: {
        uFbo: { value: null },
        uVelocityFbo: { value: null },
        uSpeed: { value: 30 },
        uDelta: { value: 0.016 },
      },
    })
    this.position = new GPGPU({
      size,
      renderer: this.context.renderer,
      shader: this.positionShader,
      initTexture: posInitTexture,
      renderTargetParams: { type: isIOS() ? THREE.HalfFloatType : THREE.FloatType },
    })
    this.context.renderTargetDebugger.registerRenderTarget('position', this.position.getBuffer())

    this.context.tweakpane.addInput(this.positionShader.uniforms.uSpeed, 'value', { label: 'Speed' })
  }

  public updateTexture(tex: THREE.Texture) {
    this.position.quad!.material.uniforms.uVelocityFbo.value = tex
  }

  public getTexture() {
    return this.position.outputTexture
  }
  public getPreviousTexture() {
    return this.position.targetA.texture
  }

  public tick(time: number, delta: number): void {
    this.positionShader.uniforms.uDelta.value = this.context.state.averageDelta

    this.position.render()
  }
}
