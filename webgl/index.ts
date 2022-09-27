import * as THREE from 'three'
import { FolderApi, ListApi, TabPageApi } from 'tweakpane'
import lerp from '~~/utils/math/lerp'
import { createContext, extendContext } from './abstract/Context'
import LifeCycle from './abstract/LifeCycle'
import NoiseGenerator from './Components/NoiseGenerator'
import RenderTargetDebugger from './Components/RenderTargetDebugger'
import Ressources from './Ressources'
import MainScene from './Scenes/MainScene'
import Stats from './Stats'

type Scenes = {
  main: MainScene | null
}
type NuxtApp = ReturnType<typeof useNuxtApp> & { $router: ReturnType<typeof useRouter> }
export default class WebGL extends LifeCycle {
  public renderer: THREE.WebGLRenderer

  public ressources: Ressources

  private stats: Stats | null
  public scenes: Scenes
  private currentScene: keyof Scenes
  private clock: THREE.Clock
  private tweakpane: FolderApi
  public state = reactive({
    isReady: false,
    pixelSize: new THREE.Vector2(),
    pixelRatio: 1,
    screenSize: new THREE.Vector2(),
    averageDelta: 0.016,
  })
  private nuxtApp: NuxtApp
  private renderTargetDebugger: RenderTargetDebugger
  private noiseGenerator: NoiseGenerator
  private globalUniforms = {}
  public context = createContext({
    clock: () => this.clock,
    renderer: () => this.renderer,
    state: () => this.state,
    tweakpane: () => this.tweakpane as FolderApi | TabPageApi,
    globalUniforms: () => this.globalUniforms,
    ressources: () => this.ressources,
    nuxtApp: () => this.nuxtApp,
    renderTargetDebugger: () => this.renderTargetDebugger,
    noiseGenerator: () => this.noiseGenerator,
  })

  constructor(nuxtApp: any) {
    super()
    this.nuxtApp = nuxtApp

    if (this.nuxtApp.$params.debug) this.stats = new Stats(true)
    this.tweakpane = this.nuxtApp.$tweakpane!

    this.setupRenderer()
    this.ressources = new Ressources(this.renderer)
    this.renderTargetDebugger = new RenderTargetDebugger(this.context)
    this.noiseGenerator = new NoiseGenerator(this.context)

    this.setupClock()
    this.setupScenes()

    this.currentScene =
      Object.keys(this.scenes!).indexOf(this.nuxtApp.$params.scene || '') > -1
        ? (this.nuxtApp.$params.scene as keyof Scenes)
        : 'main'

    const sceneBlade = this.tweakpane.addBlade({
      view: 'list',
      label: 'Scene',
      options: Object.keys(this.scenes!).map((key) => ({ text: key, value: key })),
      value: this.currentScene,
      index: 0,
    }) as ListApi<string>

    sceneBlade.on('change', ({ value }) => (this.currentScene = value as keyof Scenes))

    this.ressources.load('global')

    watch(
      () => this.ressources.gltf.queen,
      (queen) => {
        if (!queen) return
        const queenMesh = queen.scene.children[0] as THREE.Mesh
        queenMesh.geometry.rotateZ(0.3)
        queenMesh.geometry.rotateX(0.3)
        queenMesh.geometry.scale(2, 2, 2)
      }
    )
  }

  private setupScenes() {
    const tabs = this.tweakpane.addTab({ pages: [{ title: 'Main' }] })

    const mainPage = tabs.pages[0]

    this.scenes = {
      main: new MainScene(extendContext(this.context, { tweakpane: mainPage })),
    }
  }

  private setupClock() {
    this.clock = new THREE.Clock(true)

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') this.clock.start()
      if (document.visibilityState === 'hidden') this.clock.stop()
    }

    window.addEventListener('visibilitychange', onVisibilityChange, { passive: true })
  }

  private setupRenderer() {
    this.state.pixelRatio = Math.min(window.devicePixelRatio, 1.6)
    const setStateSize = () => {
      this.state.pixelSize.set(window.innerWidth * this.state.pixelRatio, window.innerHeight * this.state.pixelRatio)
      this.state.screenSize.set(window.innerWidth, window.innerHeight)
    }
    setStateSize()
    watch(() => this.state.pixelRatio, setStateSize)

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: true,
    })

    this.renderer.setClearColor('#ff0000')
    this.renderer.outputEncoding = THREE.LinearEncoding
    this.renderer.debug.checkShaderErrors = this.nuxtApp.$params.debug

    this.stats?.setRenderPanel(this.renderer.getContext())

    watchEffect(() => {
      this.renderer.setSize(this.state.pixelSize.x, this.state.pixelSize.y)
    })
  }

  public tick() {
    this.stats?.update()

    const deltaTime = this.clock.getDelta()
    this.state.averageDelta = lerp(this.state.averageDelta, deltaTime, 0.03)
    const elapsedTime = this.clock.elapsedTime

    const currentScene = this.scenes[this.currentScene]

    if (currentScene) currentScene.tick(elapsedTime, deltaTime)

    this.stats?.beforeRender()
    if (currentScene) this.renderer.render(currentScene.scene, currentScene.camera)
    this.renderTargetDebugger.tick()
    this.stats?.afterRender()
  }
}

export type WebGLAppContext = WebGL['context']
