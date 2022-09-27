import * as THREE from 'three'
import { WebGLAppContext } from '~~/webgl'
import AbstractObject from '~~/webgl/abstract/AbstractObject'
import fragmentShader from './index.frag'
import vertexShader from './index.vert'

export default class Background extends AbstractObject {
  constructor(context: WebGLAppContext) {
    super(context)

    const material = new THREE.ShaderMaterial({ fragmentShader, vertexShader, depthTest: false, depthWrite: false })
    const geom = new THREE.PlaneGeometry(2, 2)

    this.object = new THREE.Mesh(geom, material)
    this.object.frustumCulled = false
    this.object.renderOrder = -1
  }
}
