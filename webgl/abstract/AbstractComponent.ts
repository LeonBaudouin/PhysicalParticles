import { WebGLAppContext } from '..'
import ITickable from './ITickable'
import LifeCycle from './LifeCycle'

export default abstract class AbstractComponent<T extends WebGLAppContext = WebGLAppContext>
  extends LifeCycle
  implements ITickable
{
  protected context: T

  constructor(context: T) {
    super()
    this.context = context
  }

  public tick(time: number, delta: number) {}
}
