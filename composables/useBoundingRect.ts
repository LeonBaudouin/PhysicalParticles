import ResizeObserver from 'resize-observer-polyfill'
import tuple from '~~/utils/types/tuple'

export default function useBoundingRect() {
  const element = ref<HTMLElement>()
  const boundingRect = ref<DOMRect>()

  useCleanup(() => {
    const observer = new ResizeObserver(() => {
      boundingRect.value = element.value?.getBoundingClientRect()
    })
    observer.observe(element.value!)
    return () => observer.disconnect()
  })

  return tuple(element, boundingRect)
}
