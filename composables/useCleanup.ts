export default function useCleanup(hook: () => (() => void) | void) {
  let stop = () => {}
  onMounted(() => {
    const cleanup = hook()
    if (cleanup) stop = cleanup
  })

  onUnmounted(() => {
    stop()
  })
}
