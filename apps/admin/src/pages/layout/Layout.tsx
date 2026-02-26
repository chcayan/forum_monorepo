import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import styles from './layout.module.scss'
import { useUserStore } from '@/stores'
import { RoutePath } from '@/router/route'
import LogoSvg from '@/components/svg/LogoSvg'
import LogoutSvg from '@/components/svg/LogoutSvg'
import ThemeToggleBtn from '@/components/button/ThemeToggleBtn'
import LanguageToggleBtn from '@/components/button/LanguageToggleBtn'

export default function Layout() {
  const navigate = useNavigate()

  const userInfo = useUserStore((state) => state.userInfo)
  const permissions = useUserStore((state) => state.permissions)
  console.log(permissions)

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
            <li className={styles.li}>概述</li>
            {permissions.includes('audit_post') && (
              <li className={styles.li}>帖子审核</li>
            )}
            {permissions.includes('edit_post') && (
              <li className={styles.li}>修改帖子状态</li>
            )}{' '}
            {permissions.includes('edit_user') && (
              <li className={styles.li}>修改用户状态</li>
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
        <Outlet />
      </div>
    </div>
  )
}
