type Color = `#${number}${number}${number}${number}${number}${number}`
type Vector = THREE.Vector2 | THREE.Vector3 | THREE.Vector4
type Interval = { min: number; max: number }

type ValueToUniform = number | boolean | Color | Vector | Interval | THREE.Euler
export type CustomWatch<T extends ValueToUniform | any = ValueToUniform> = (
  uniform: THREE.IUniform,
  object: Record<string, T>,
  key: string
) => () => void
type UniformType = 'number' | 'boolean' | 'Color' | 'Vector' | 'Interval' | 'Euler' | 'Any'

import * as THREE from 'three'

const DEBUG = false

function findKey(key: string, uniforms: Record<string, THREE.IUniform>) {
  if (key in uniforms) return key

  const keyWithU = `u${key[0].toUpperCase()}${key.slice(1)}`
  if (keyWithU in uniforms) return keyWithU

  const keyWithT = `t${key[0].toUpperCase()}${key.slice(1)}`
  if (keyWithT in uniforms) return keyWithT
}

function parseType(value: ValueToUniform): UniformType | undefined {
  if (typeof value === 'boolean') return 'boolean'
  if (typeof value === 'number') return 'number'
  if (typeof value === 'string' && value.startsWith('#')) return 'Color'
  if (value === null) return 'Any'
  if (typeof value === 'object' && 'addVectors' in value) return 'Vector'
  if (typeof value === 'object' && 'isEuler' in value) return 'Euler'
  if (typeof value === 'object' && 'min' in value) return 'Interval'
  return 'Any'
}

function buildWatch(uniform: THREE.IUniform, type: UniformType, object: Record<string, ValueToUniform>, key: string) {
  switch (type) {
    case 'number':
    case 'boolean':
    case 'Any':
      return watchEffect(() => (uniform.value = object[key]))
    case 'Color':
      return watchEffect(() => uniform.value.set(object[key]))
    case 'Interval':
      return watch(
        [() => (object[key] as Interval).min, () => (object[key] as Interval).max],
        (values) => uniform.value.set(...values),
        { immediate: true }
      )
    case 'Euler':
      return watch(
        [
          () => (object[key] as THREE.Euler).x,
          () => (object[key] as THREE.Euler).y,
          () => (object[key] as THREE.Euler).z,
        ],
        (values) => uniform.value.set(...values),
        { immediate: true }
      )
    case 'Vector':
      return watch(
        [
          () => (object[key] as Vector).x,
          () => (object[key] as Vector).y,
          () => (object[key] as THREE.Vector3)?.z,
          () => (object[key] as THREE.Vector4)?.w,
        ],
        (values) => uniform.value.set(...values),
        { immediate: true }
      )
  }
}

export default function reactiveUniforms(
  uniforms: Record<string, THREE.IUniform>,
  object: Record<string, ValueToUniform | any>,
  custom: Record<string, CustomWatch | any | null> = {},
  debug: boolean = DEBUG
) {
  const unbindArray: (() => void)[] = []

  for (const key of Object.keys(object)) {
    const uniformKey = findKey(key, uniforms)
    if (uniformKey == null) {
      if (debug) console.warn(`"${key}" was not found in uniforms`)
      continue
    }

    if (key in custom && custom[key]) {
      let unbind = custom[key](uniforms[uniformKey], object, key)
      unbindArray.push(unbind)
      continue
    }

    const type = parseType(object[key])
    if (type == null) {
      if (debug) console.warn(`"${key}" value could not be parsed`)
      continue
    }

    let unbind = buildWatch(uniforms[uniformKey], type, object, key)
    unbindArray.push(unbind)
  }

  return unbindArray
}
