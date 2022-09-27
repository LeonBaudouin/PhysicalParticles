import { WebGLAppContext } from '..'
import { Object3D } from 'three'
import AbstractComponent from './AbstractComponent'

export default abstract class AbstractObject<
  T extends WebGLAppContext = WebGLAppContext,
  O extends Object3D = Object3D
> extends AbstractComponent<T> {
  public object: O
}
