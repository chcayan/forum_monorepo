import { createApp } from 'vue'

import App from './App.vue'
import router from './router'

import './scss/index.scss'
import pinia from './stores'
import { directives } from './utils/directives'

const app = createApp(App)

Object.keys(directives).forEach((key) => {
  app.directive(key, directives[key])
})

app.use(router)
app.use(pinia)

app.mount('#app')
