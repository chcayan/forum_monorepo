import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import i18n from '@/i18n'
import AppRouter from '@/router'
import { useUserStore } from '@/stores'

function App() {
  const { t } = useTranslation()
  console.log(555)

  const setPermissions = useUserStore((state) => state.setPermissions)

  useEffect(() => {
    setPermissions(['edit_post', 'edit_user'])
  }, [setPermissions])

  return (
    <div>
      <h1>{t('common.hello')}</h1>
      <p>{t('home.title')}</p>

      <p>{t('home.description')}</p>

      <button onClick={() => i18n.changeLanguage('zh')}>中文</button>

      <button onClick={() => i18n.changeLanguage('en')}>English</button>
      <AppRouter />
    </div>
  )
}

export default App
