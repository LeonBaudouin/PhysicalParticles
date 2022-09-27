import { Camera, Scene } from 'three'
import { WebGLAppContext } from '..'
import AbstractComponent from './AbstractComponent'

export default abstract class AbstractScene<
  T extends WebGLAppContext = WebGLAppContext,
  C extends Camera = Camera
> extends AbstractComponent<T> {
  public scene: Scene
  public camera: C
}
