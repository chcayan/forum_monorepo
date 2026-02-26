import { useEffect } from 'react'
import AppRouter from './router'
import { useStatusStore, useUserStore } from './stores'
import { useNavigate } from 'react-router-dom'
import { RoutePath } from './router/router'
import emitter from './utils/eventEmitter'
import { Toast } from './utils'
import i18n from './i18n'

function App() {
  const navigate = useNavigate()

  useEffect(() => {
    const { token, removeToken, permissions, setPermissions } =
      useUserStore.getState()

    if (!token) {
      removeToken()
      navigate(RoutePath.login)
      return
    }

    setPermissions(permissions)
  }, [navigate])

  useEffect(() => {
    console.log('app effect')
    const { currentTheme, currentLanguage } = useStatusStore.getState()
    // 主题
    document.body.dataset.theme = currentTheme

    // 语言
    i18n.changeLanguage(currentLanguage)
    console.log(currentLanguage)

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
