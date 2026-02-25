import { useEffect } from 'react'
import AppRouter from './router'
import { useUserStore } from './stores'
import { useNavigate } from 'react-router-dom'
import { RoutePath } from './router/router'
import emitter from './utils/eventEmitter'
import { Toast } from './utils'

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
    const { removeToken } = useUserStore.getState()
    emitter.on('API:UN_AUTH', (message: string) => {
      Toast.show({
        msg: message,
        type: 'error',
      })
      removeToken()
    })

    emitter.on('API:FORBIDDEN', (message: string) => {
      Toast.show({
        msg: message,
        type: 'error',
      })
    })
  }, [])

  return <AppRouter />
}

export default App
