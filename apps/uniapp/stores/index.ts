import { createPinia } from 'pinia'
const pinia = createPinia()

export default pinia
export * from './modules/user'
export * from './modules/post'
export * from './modules/temp'
export * from './modules/status'
