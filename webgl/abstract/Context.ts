type AccessorObject<T extends Object> = { [P in keyof T]: T[P] | (() => T[P]) }

type ContextProxy<T extends Object> = T & { __accessor: AccessorObject<T> }

export function createContext<T extends Object>(target: AccessorObject<T>) {
  const proxyTarget = {
    __accessor: { ...target },
  }

  const handler: ProxyHandler<T> = {
    get(_, p) {
      if (p === '__accessor') return proxyTarget.__accessor
      const accessor = proxyTarget.__accessor[p]
      return typeof accessor === 'function' ? accessor() : accessor
    },
    has(_, prop) {
      return prop === '__accessor' || !!proxyTarget.__accessor.hasOwnProperty(prop)
    },
    ownKeys() {
      return [...Object.keys(proxyTarget.__accessor), '__accessor']
    },
    set(target, p, newValue) {
      if (p === '__accessor') {
        target[p] = newValue
        return true
      }
      throw new Error('Context are not meant to be directly edited, use extendContext instead')
    },
    getOwnPropertyDescriptor(target, p) {
      return {
        enumerable: true,
        configurable: true,
      }
    },
  }

  return new Proxy(proxyTarget as unknown as T, handler) as T
}

export function extendContext<A extends Object, B extends Object>(target: A, source: AccessorObject<B>) {
  const targetProxy = target as ContextProxy<A>
  if (!('__accessor' in targetProxy)) throw new Error('extendContext should receive a context as first argument')
  const accessor = { ...targetProxy.__accessor, ...source } as A & B
  const newContext = createContext<A & B>(accessor)
  return newContext
}
