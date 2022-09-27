export default function cartesianToSpherical(input: THREE.Vector3, output: THREE.Vector3) {
  const { x, y, z } = input

  const rho = input.length()
  const theta = Math.atan2(y, x)
  const phi = Math.acos(z / Math.sqrt(x * x + y * y + z * z))
  output.set(phi, rho, theta)
}
