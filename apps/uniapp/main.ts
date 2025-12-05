import App from './App'

import { createSSRApp } from 'vue'
import pinia from './stores'
import './scss/index.scss'

export function createApp() {
  const app = createSSRApp(App)

  app.use(pinia)
  return {
    app,
  }
}
