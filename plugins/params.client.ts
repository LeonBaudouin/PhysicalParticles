export type Params = { debug: boolean; scene: string | null; dom: boolean }
export const DEFAULT_PARAMS: Params = { debug: true, scene: null, dom: true }

const paramsPlugin = defineNuxtPlugin<{ params: Params }>(() => {
  const searchParams = new URL(window.location.href).searchParams
  const v = <K extends keyof Params>(value: Params[K], paramName: K, urlName: string = paramName) =>
    searchParams.has(urlName) ? value : DEFAULT_PARAMS[paramName]
  return {
    provide: {
      params: {
        dom: v(searchParams.get('dom') !== 'false', 'dom'),
        debug: v(searchParams.get('debug') !== 'false', 'debug'),
        scene: v(searchParams.get('scene'), 'scene'),
      },
    },
  }
})

export default paramsPlugin
