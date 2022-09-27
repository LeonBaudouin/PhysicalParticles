import { Vector3Tuple } from 'three'

export function inSphere(
  buffer: Float32Array,
  { radius, center }: { radius: number; center: Vector3Tuple },
  fourElements = false
) {
  for (let i = 0; i < buffer.length; i += fourElements ? 4 : 3) {
    const u = Math.pow(Math.random(), 1 / 3)

    let x = Math.random() * 2 - 1
    let y = Math.random() * 2 - 1
    let z = Math.random() * 2 - 1

    const mag = Math.sqrt(x * x + y * y + z * z)

    x = (u * x) / mag
    y = (u * y) / mag
    z = (u * z) / mag

    buffer[i] = x * radius + center[0]
    buffer[i + 1] = y * radius + center[1]
    buffer[i + 2] = z * radius + center[2]
  }

  return buffer
}
