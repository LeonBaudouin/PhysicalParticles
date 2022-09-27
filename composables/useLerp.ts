import { Ref } from 'vue-demi'
import lerp from '~~/utils/math/lerp'
import round from '~~/utils/math/round'

function useSingleValueLerp(target: Ref<number>, params: { amount: number; precision?: number }) {
  const rawOutput = ref(target.value)
  const output = ref(target.value)

  useRaf(() => {
    rawOutput.value = lerp(rawOutput.value, target.value, params.amount)
    output.value = round(rawOutput.value, params.precision || 3)
  })

  return readonly(output)
}

function useVectorLerp(target: { x: number; y: number; z?: number }, params: { amount: number; precision?: number }) {
  const rawOutput = reactive({ ...target })
  const output = reactive({ ...target })

  useRaf(() => {
    rawOutput.x = lerp(rawOutput.x, target.x, params.amount)
    rawOutput.y = lerp(rawOutput.y, target.y, params.amount)
    output.x = round(rawOutput.x, params.precision || 3)
    output.y = round(rawOutput.y, params.precision || 3)
  })

  return readonly(output)
}

export default function useLerp<T extends ReturnType<typeof useSingleValueLerp | typeof useVectorLerp>>(
  target: T,
  params: { amount: number; precision?: number }
): T {
  const isVector = 'x' in target
  let output
  if (isVector) {
    output = useVectorLerp(target, params)
  } else {
    output = useSingleValueLerp(target, params)
  }

  return output
}
