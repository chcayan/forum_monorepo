import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import i18n from '@/i18n'
import AppRouter from '@/router'
import { useUserStore } from '@/stores'
import { loginAPI } from './api'

function App() {
  const { t } = useTranslation()
  console.log(555)

  // const token = useUserStore((state) => state.token)
  const permissions = useUserStore((state) => state.permissions)

  const setPermissions = useUserStore((state) => state.setPermissions)
  const setToken = useUserStore((state) => state.setToken)
  // const removeToken = useUserStore((state) => state.removeToken)

  const login = async () => {
    console.log('login')
    const res = await loginAPI({
      email: 'chcaya@qq.com',
      password: 'chcaya',
    })
    console.log(res.data.data.token)

    setToken(res.data.data.token)
    setPermissions(Object.values(res.data.data.permissions))
    console.log(res.data.data)
  }
  useEffect(() => {
    const { token, removeToken, permissions, setPermissions } =
      useUserStore.getState()

    setPermissions(permissions)
    if (!token) {
      removeToken()
    }
  }, [])

  return (
    <div>
      <h1>{t('common.hello')}</h1>
      <p>{t('home.title')}</p>

      <p>{t('home.description')}</p>

      <button onClick={() => i18n.changeLanguage('zh')}>中文</button>

      <button onClick={() => i18n.changeLanguage('en')}>English</button>
      <button onClick={login}>登录</button>
      {permissions && <div>permission</div>}

      <AppRouter />
    </div>
  )
}

export default App
