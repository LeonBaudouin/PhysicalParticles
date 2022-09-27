import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader'
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as THREE from 'three'
import LOADING_GROUP from './LOADING_GROUP'
import RESSOURCES_DATA from './RESSOURCES_DATA'

export type GLTFRessourceName = keyof typeof RESSOURCES_DATA['gltf']
type GLTFRessource = Record<GLTFRessourceName, GLTF | null>

export type TextureRessourceName = keyof typeof RESSOURCES_DATA['textures']
type TextureRessource = Record<TextureRessourceName, THREE.Texture | null>

type LoadingGroup = keyof typeof LOADING_GROUP

export default class Ressources {
  private loadingManager = new THREE.LoadingManager()
  private textureLoader: THREE.TextureLoader
  private gltfLoader: GLTFLoader
  private ktx2Loader: KTX2Loader | null = null

  public gltf = shallowReactive<GLTFRessource>(
    Object.fromEntries(Object.keys(RESSOURCES_DATA['gltf']).map((name) => [name, null])) as any
  )

  public textures = shallowReactive<TextureRessource>(
    Object.fromEntries(Object.keys(RESSOURCES_DATA['textures']).map((name) => [name, null])) as any
  )

  public progress = reactive<Record<LoadingGroup, number>>(
    Object.fromEntries(Object.keys(LOADING_GROUP).map((name) => [name, 0])) as any
  )

  constructor(renderer: THREE.WebGLRenderer, useCompression: { useKtx?: boolean; useDraco?: boolean } = {}) {
    this.setupLoaders(renderer, useCompression)

    watch(
      [this.gltf, this.textures],
      () => {
        for (const [loadingGroupName, { gltf: gltfName, textures: texturesName }] of Object.entries(LOADING_GROUP)) {
          const loadedGltf = gltfName.map((name) => this.gltf[name]).filter((v) => v !== null)
          const loadedTextures = texturesName.map((name) => this.textures[name]).filter((v) => v !== null)
          const total = gltfName.length + texturesName.length
          const loaded = loadedGltf.length + loadedTextures.length
          this.progress[loadingGroupName] = loaded / total
        }
      },
      { flush: 'sync' }
    )
  }

  public load(loadingGroup: LoadingGroup) {
    const data = LOADING_GROUP[loadingGroup]

    for (const gltfName of data.gltf) {
      if (this.gltf[gltfName]) continue
      const gltfData = RESSOURCES_DATA['gltf'][gltfName]
      this.gltfLoader.load(gltfData, (gltf) => {
        this.gltf[gltfName] = gltf
      })
    }

    for (const texturesName of data.textures) {
      if (this.textures[texturesName]) continue
      const { url, ...props } = RESSOURCES_DATA['textures'][texturesName]

      const loader = url.endsWith('.ktx2') ? this.ktx2Loader : this.textureLoader
      if (!loader) throw new Error('ktx compression is not enabled')
      loader.load(url, (texture) => {
        for (const [propName, propValue] of Object.entries(props)) texture[propName] = propValue
        this.textures[texturesName] = texture
      })
    }
  }

  private setupLoaders(renderer: THREE.WebGLRenderer, { useKtx = false, useDraco = false }) {
    this.textureLoader = new THREE.TextureLoader(this.loadingManager)
    this.gltfLoader = new GLTFLoader(this.loadingManager)
    if (useDraco) {
      const dracoLoader = new DRACOLoader()
      dracoLoader.setDecoderPath('/libs/draco/')
      this.gltfLoader.setDRACOLoader(dracoLoader)
    }

    if (useKtx) {
      this.ktx2Loader = new KTX2Loader(this.loadingManager)
      this.ktx2Loader.setTranscoderPath('/libs/basis/')
      this.ktx2Loader.detectSupport(renderer)
      this.gltfLoader.setKTX2Loader(this.ktx2Loader)
    }
  }
}
