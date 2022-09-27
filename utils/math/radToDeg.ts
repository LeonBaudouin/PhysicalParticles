const RAD2DEG = 180 / Math.PI

export default function radToDeg(radians: number): number {
  return radians * RAD2DEG
}
