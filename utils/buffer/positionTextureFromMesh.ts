import * as THREE from 'three'
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler'

export function getPositionTextureFromMesh(
  sampler: MeshSurfaceSampler,
  textureSize: THREE.Vector2 | THREE.Vector2Tuple,
  sampleAmount: number = 0
) {
  const size = Array.isArray(textureSize) ? textureSize : textureSize.toArray()

  const amount = sampleAmount || size[0] * size[1]
  const positions = new Float32Array(size[0] * size[1] * 4)
  const colors = new Float32Array(size[0] * size[1] * 4)
  const normals = new Float32Array(size[0] * size[1] * 4)

  const position = new THREE.Vector3()
  const normal = new THREE.Vector3()
  const color = new THREE.Color()

  for (let index = 0; index < amount; index++) {
    sampler.sample(position, normal, color)
    positions[index * 4 + 0] = position.x
    positions[index * 4 + 1] = position.y
    positions[index * 4 + 2] = position.z
    positions[index * 4 + 3] = 0

    colors[index * 4 + 0] = color.r
    colors[index * 4 + 1] = color.g
    colors[index * 4 + 2] = color.b
    colors[index * 4 + 3] = 0

    normals[index * 4 + 0] = normal.x
    normals[index * 4 + 1] = normal.y
    normals[index * 4 + 2] = normal.z
    normals[index * 4 + 3] = 0
  }

  const positionTexture = new THREE.DataTexture(positions, size[0], size[1], THREE.RGBAFormat, THREE.FloatType)
  positionTexture.needsUpdate = true

  const colorTexture = new THREE.DataTexture(colors, size[0], size[1], THREE.RGBAFormat, THREE.FloatType)
  colorTexture.needsUpdate = true

  const normalTexture = new THREE.DataTexture(normals, size[0], size[1], THREE.RGBAFormat, THREE.FloatType)
  normalTexture.needsUpdate = true

  return { position: positionTexture, color: colorTexture, normal: normalTexture }
}
