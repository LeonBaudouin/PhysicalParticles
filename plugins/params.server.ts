import { DEFAULT_PARAMS } from './params.client'

export default defineNuxtPlugin(() => {
  return {
    provide: {
      params: DEFAULT_PARAMS,
    },
  }
})
