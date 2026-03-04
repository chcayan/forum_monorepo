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
import PostReviewSvg from '@/components/svg/PostReviewSvg'
import PostReportReviewSvg from '@/components/svg/PostReportReviewSvg'
import UserPermModifySvg from '@/components/svg/UserPermModifySvg'
import CommentReportReviewSvg from '@/components/svg/CommentReportReviewSvg'
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
    const { token, permissions, removeToken, setUserInfo } =
      useUserStore.getState()

    if (!token || permissions.length === 0) {
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
            {permissions.includes('post_review') && (
              <li
                className={`${styles.li} ${location.pathname === RoutePath.postReview ? styles['active'] : ''}`}
                onClick={() => navigateToXXX(RoutePath.postReview)}
              >
                <PostReviewSvg />
                {t('layout.postReviewNav')}
              </li>
            )}
            {permissions.includes('report_review') && (
              <li
                className={`${styles.li} ${location.pathname === RoutePath.postReportReview ? styles['active'] : ''}`}
                onClick={() => navigateToXXX(RoutePath.postReportReview)}
              >
                <PostReportReviewSvg />
                {t('layout.postReportReviewNav')}
              </li>
            )}
            {permissions.includes('report_review') && (
              <li
                className={`${styles.li} ${location.pathname === RoutePath.commentReportReview ? styles['active'] : ''}`}
                onClick={() => navigateToXXX(RoutePath.commentReportReview)}
              >
                <CommentReportReviewSvg />
                {t('layout.commentReportReviewNav')}
              </li>
            )}
            {permissions.includes('user_perm_modify') && (
              <li
                className={`${styles.li} ${location.pathname === RoutePath.userPermModify ? styles['active'] : ''}`}
                onClick={() => navigateToXXX(RoutePath.userPermModify)}
              >
                <UserPermModifySvg />
                {t('layout.userPermModifyNav')}
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
