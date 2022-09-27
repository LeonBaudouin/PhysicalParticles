import WebGL from '~~/webgl'

export default defineNuxtPlugin((nuxtApp) => {
  let webgl
  try {
    webgl = new WebGL(nuxtApp)
  } catch (error) {
    console.error(error)
  }
  return {
    provide: {
      webgl,
    },
  }
})
