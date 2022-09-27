export default function sphericalToCartesian(input: THREE.Vector3, output: THREE.Vector3) {
  const theta = input.x
  const phi = input.z
  const rho = input.y
  output.set(rho * Math.sin(theta) * Math.cos(phi), rho * Math.sin(theta) * Math.sin(phi), rho * Math.cos(theta))
}
