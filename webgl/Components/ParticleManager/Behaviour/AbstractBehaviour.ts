import AbstractComponent from '~~/webgl/abstract/AbstractComponent'
import { ParticleSystemParams } from '../../Particles'
import { WebGLAppContext } from '~~/webgl'

export type BehaviourContext = WebGLAppContext & {
  particleParams: Required<ParticleSystemParams>
}

export default abstract class AbstractBehaviour extends AbstractComponent<BehaviourContext> {}
