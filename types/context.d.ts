export type SceneContext<T extends THREE.Camera = THREE.Camera> = WebGLAppContext & {
  scene: AbstractScene<WebGLAppContext, T>
}
