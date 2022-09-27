export default function useRaf(hook: () => void) {
  useCleanup(() => {
    const loop = () => {
      hook()
      rafId = requestAnimationFrame(loop)
    }
    let rafId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafId)
    }
  })
}
