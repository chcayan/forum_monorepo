import { useEffect } from 'react'
import AppRouter from './router'
import { useStatusStore, useUserStore } from './stores'
import emitter from './utils/eventEmitter'
import { Toast } from './utils'
import i18n from './i18n'
import { useNavigate } from 'react-router-dom'
import { RoutePath } from './router/route'

function App() {
  const navigate = useNavigate()

  useEffect(() => {
    // console.log('app effect')
    const { currentTheme, currentLanguage } = useStatusStore.getState()

    // 主题
    document.body.dataset.theme = currentTheme

    // 语言
    i18n.changeLanguage(currentLanguage)

    // api
    const { removeToken } = useUserStore.getState()
    const unAuthOff = emitter.on('API:UN_AUTH', (message: string) => {
      Toast.show({
        msg: message,
        type: 'error',
      })
      removeToken()
      navigate(RoutePath.login)
    })

    const forbiddenOff = emitter.on('API:FORBIDDEN', (message: string) => {
      Toast.show({
        msg: message,
        type: 'error',
      })
    })

    return () => {
      unAuthOff()
      forbiddenOff()
    }
  }, [navigate])

  return <AppRouter />
}

export default App
