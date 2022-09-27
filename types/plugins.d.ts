import { Pane } from 'tweakpane'
import WebGL from '~~/webgl'

declare module '#app' {
  interface NuxtApp {
    $webgl: WebGL | null
  }
}

declare module '#app' {
  interface NuxtApp {
    $tweakpane: Pane | null
  }
}
