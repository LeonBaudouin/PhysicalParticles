import { Vector3Tuple } from 'three'

const TAU = Math.PI * 2

export function onSphere(
  buffer: Float32Array,
  { radius, center }: { radius: number; center: Vector3Tuple },
  fourElements = false
) {
  for (let i = 0; i < buffer.length; i += fourElements ? 4 : 3) {
    const u = Math.random()
    const v = Math.random()

    const theta = Math.acos(2 * v - 1)
    const phi = TAU * u

    buffer[i] = Math.sin(theta) * Math.cos(phi) * radius + center[0]
    buffer[i + 1] = Math.sin(theta) * Math.sin(phi) * radius + center[1]
    buffer[i + 2] = Math.cos(theta) * radius + center[2]
  }

  return buffer
}
