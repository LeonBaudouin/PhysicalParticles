import lerp from '~~/utils/math/lerp'

type Lerpable =
  | THREE.Vector2
  | THREE.Vector3
  | THREE.Vector4
  | THREE.Color
  | { min: number; max: number }
  | THREE.Euler
  | number
  | any

export default function pseudoDeepLerp<T extends Record<string, Lerpable>>(from: T, to: T, target: T, factor: number) {
  for (const [key, value] of Object.entries(to)) {
    if (typeof value === 'number') {
      ;(target[key] as number) = lerp(from[key] as number, to[key] as number, factor)
      continue
    }
    if (typeof value === 'boolean') (target[key] as boolean) = value
    if (typeof value !== 'object') continue
    if ('isEuler' in value) {
      const targetEuler = target[key] as THREE.Euler
      const fromEuler = from[key] as THREE.Euler
      targetEuler.x = lerp(fromEuler.x, value.x, factor)
      targetEuler.y = lerp(fromEuler.y, value.y, factor)
      targetEuler.z = lerp(fromEuler.z, value.z, factor)
      continue
    }
    if ('isVector2' in value || 'isVector3' in value || 'isVector4' in value) {
      const toVector = value as THREE.Vector2
      const targetVector = target[key] as THREE.Vector2
      const fromVector = from[key] as THREE.Vector2
      targetVector.lerpVectors(fromVector, toVector, factor)
      continue
    }
    if ('isColor' in value) {
      const targetColor = target[key] as THREE.Color
      const fromColor = from[key] as THREE.Color
      targetColor.lerpColors(fromColor, value, factor)
      continue
    }
    if ('min' in value) {
      const targetRange = target[key] as { min: number; max: number }
      const fromRange = from[key] as { min: number; max: number }
      targetRange.min = lerp(fromRange.min, value.min, factor)
      targetRange.max = lerp(fromRange.max, value.max, factor)
      continue
    }
  }
}
