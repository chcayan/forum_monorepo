import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import styles from './layout.module.scss'
import { useStatusStore, useUserStore } from '@/stores'
import { RoutePath } from '@/router/route'
import LogoSvg from '@/components/svg/LogoSvg'
import LogoutSvg from '@/components/svg/LogoutSvg'
import ThemeToggleBtn from '@/components/button/ThemeToggleBtn'
import LanguageToggleBtn from '@/components/button/LanguageToggleBtn'
import { useTranslation } from 'react-i18next'
import OverviewSvg from '@/components/svg/OverviewSvg'
import AuditPostSvg from '@/components/svg/AuditPostSvg'
import EditPostSvg from '@/components/svg/EditPostSvg'
import EditUserSvg from '@/components/svg/EditUserSvg'
import { ConfigProvider, theme } from 'antd'

export default function Layout() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()

  const navigateToXXX = (route: string) => {
    if (location.pathname === route) return
    navigate(route)
  }

  const currentTheme = useStatusStore((state) => state.currentTheme)
  const userInfo = useUserStore((state) => state.userInfo)
  const permissions = useUserStore((state) => state.permissions)

  useEffect(() => {
    // init user
    const { token, removeToken, setUserInfo } = useUserStore.getState()

    if (!token) {
      removeToken()
      navigate(RoutePath.login)
    }

    if (token) {
      setUserInfo()
    }
  }, [navigate])

  return (
    <div className={styles.layout}>
      <div className={styles.left}>
        <header className={styles.header}>
          <LogoSvg />
          <p className={styles.p}>forum</p>
        </header>
        <main className={styles.main}>
          <ul className={styles.ul}>
            <li
              className={`${styles.li} ${location.pathname === RoutePath.overview ? styles['active'] : ''}`}
              onClick={() => navigateToXXX(RoutePath.overview)}
            >
              <OverviewSvg />
              {t('layout.overviewNav')}
            </li>
            {permissions.includes('audit_post') && (
              <li
                className={`${styles.li} ${location.pathname === RoutePath.auditPost ? styles['active'] : ''}`}
                onClick={() => navigateToXXX(RoutePath.auditPost)}
              >
                <AuditPostSvg />
                {t('layout.auditPostNav')}
              </li>
            )}
            {permissions.includes('edit_post') && (
              <li
                className={`${styles.li} ${location.pathname === RoutePath.editPost ? styles['active'] : ''}`}
                onClick={() => navigateToXXX(RoutePath.editPost)}
              >
                <EditPostSvg />
                {t('layout.editPostNav')}
              </li>
            )}{' '}
            {permissions.includes('edit_user') && (
              <li
                className={`${styles.li} ${location.pathname === RoutePath.editUser ? styles['active'] : ''}`}
                onClick={() => navigateToXXX(RoutePath.editUser)}
              >
                <EditUserSvg />
                {t('layout.editUserNav')}
              </li>
            )}
          </ul>
        </main>
      </div>
      <div className={styles.right}>
        <header className={styles.header}>
          <LogoutSvg />
          <ThemeToggleBtn />
          <LanguageToggleBtn />
          {userInfo.userAvatar && (
            <img className={styles.avatar} src={userInfo.userAvatar} />
          )}
        </header>
        <main className={styles.main}>
          <ConfigProvider
            theme={{
              algorithm:
                currentTheme === 'Dark'
                  ? theme.darkAlgorithm
                  : theme.defaultAlgorithm,
            }}
          >
            <Outlet />
          </ConfigProvider>
        </main>
      </div>
    </div>
  )
}
