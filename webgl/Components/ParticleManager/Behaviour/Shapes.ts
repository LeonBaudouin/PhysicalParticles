import { MainSceneContext } from '~~/webgl/Scenes/MainScene'
import AbstractBehaviour, { BehaviourContext } from './AbstractBehaviour'
import * as THREE from 'three'
import { getPositionTextureFromMesh } from '~~/utils/buffer/positionTextureFromMesh'
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler'

export default class Shapes extends AbstractBehaviour {
  protected declare context: MainSceneContext & BehaviourContext
  constructor(context: BehaviourContext) {
    super(context)

    const lastInertia = { ...this.context.particleParams.inertia }
    const lastSizeVariation = this.context.particleParams.sizeVariation.clone()
    const lastUseTexture = this.context.particleParams.useTexture
    const lastGravity = this.context.particleParams.gravity.clone()

    const coneMesh = new THREE.Mesh(
      new THREE.ConeBufferGeometry(6, 8, 3, 1).rotateX(Math.PI / 2 + 0.2).translate(5, 0, 0)
    )
    const sampler = new MeshSurfaceSampler(coneMesh).build()
    const { position: cone } = getPositionTextureFromMesh(sampler, new THREE.Vector2(64, 64))

    const box = this.genTextureFromGeom(new THREE.BoxBufferGeometry(4, 8, 4, 10, 20, 10))

    const icosahedron = this.genTextureFromGeom(new THREE.IcosahedronBufferGeometry(4, 5).translate(-5, 0, 0))

    const textures = [icosahedron, box, cone]
    let index = 0

    this.context.particleParams.attractorsTexture = textures[index]

    let intervalId = setInterval(() => {
      index = (1 + index) % textures.length
      this.context.particleParams.attractorsTexture = textures[index]
    }, 7000)

    this.context.particleParams.inertia.min = 0.032
    this.context.particleParams.inertia.max = 0.7
    this.context.particleParams.sizeVariation.set(0.12, 0.05, 0.0, 0.5)
    this.context.particleParams.useTexture = true
    this.context.particleParams.gravity.set(0, 0, 0)

    this.toUnbind(() => {
      this.context.particleParams.sizeVariation.copy(lastSizeVariation)
      this.context.particleParams.useTexture = lastUseTexture
      this.context.particleParams.inertia.min = lastInertia.min
      this.context.particleParams.inertia.max = lastInertia.max
      this.context.particleParams.gravity.copy(lastGravity)
      clearInterval(intervalId)
    })
  }

  private genTextureFromGeom(geom: THREE.BufferGeometry) {
    const array = new Float32Array(4096 * 4).fill(0)
    for (let index = 0; index < 4096; index++) {
      const i = index % geom.attributes.position.count
      array[index * 4 + 0] = geom.attributes.position.array[i * 3 + 0]
      array[index * 4 + 1] = geom.attributes.position.array[i * 3 + 1]
      array[index * 4 + 2] = geom.attributes.position.array[i * 3 + 2]
    }
    const texture = new THREE.DataTexture(array, 64, 64, THREE.RGBAFormat, THREE.FloatType)
    texture.needsUpdate = true
    return texture
  }
}
