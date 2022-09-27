import gsap from 'gsap/all'
import { UnwrapNestedRefs } from 'vue-demi'

export default function useAnimateValue<T extends object>(input: T, params: GSAPTweenVars = {}) {
  const output = reactive(isRef(input) ? { value: input.value } : { ...input }) as UnwrapNestedRefs<T>

  watch(input, () => {
    gsap.to(output, isRef(input) ? { value: input.value, ...params } : { ...input, ...params })
  })

  return readonly(output)
}
