import { createApp } from 'vue'

import App from './App.vue'
import router from './router'

import './scss/index.scss'
import pinia from './stores'
import { directives } from './utils/directives'
import { initErrorMonitor } from './monitor/errorMonitor'

const app = createApp(App)
initErrorMonitor(app)

Object.keys(directives).forEach((key) => {
  app.directive(key, directives[key])
})

app.use(router)
app.use(pinia)

app.mount('#app')
