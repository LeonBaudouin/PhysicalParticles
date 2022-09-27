import { Camera, Scene, ShaderMaterial } from 'three'
import { WebGLAppContext } from '..'
import AbstractComponent from './AbstractComponent'

export default abstract class AbstractMaterial<
  T extends WebGLAppContext = WebGLAppContext
> extends AbstractComponent<T> {
  public material: ShaderMaterial

  public destroy(): void {
    super.destroy()
    this.material.dispose()
  }
}
