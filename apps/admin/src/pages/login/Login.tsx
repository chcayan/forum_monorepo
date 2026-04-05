import { useState, useEffect, useEffectEvent } from 'react'
import styles from './login.module.scss'
import { isValidEmail, isValidPassword, Toast } from '@/utils'
import { loginAPI } from '@/api'
import { useStatusStore, useUserStore } from '@/stores'
import { RoutePath } from '@/router/route'
import { useNavigate } from 'react-router-dom'
import ThemeToggleBtn from '@/components/button/ThemeToggleBtn'
import LanguageToggleBtn from '@/components/button/LanguageToggleBtn'
import { useTranslation } from 'react-i18next'

const themeColor = '#ff9e6a'

export default function Login() {
  const { t } = useTranslation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(
    null
  )
  const [authStatus, setAuthStatus] = useState<'idle' | 'success' | 'error'>(
    'idle'
  )

  const resetAuthStatus = useEffectEvent(() => {
    if (authStatus !== 'idle') setAuthStatus('idle')
  })

  useEffect(() => {
    if (email || password) {
      resetAuthStatus()
    }
  }, [email, password])

  const currentTheme = useStatusStore((state) => state.currentTheme)

  // const setPermissions = useUserStore((state) => state.setPermissions)
  const setToken = useUserStore((state) => state.setToken)
  const navigate = useNavigate()

  const handleLogin = async () => {
    if (!isValidEmail(email) || !isValidPassword(password)) {
      setAuthStatus('error')
      return
    }
    const res = await loginAPI({
      email,
      password,
    })

    const data = res.data.data

    setToken(data.accessToken)
    // setPermissions(Object.values(data.permissions))

    Toast.show({
      msg: t('login.loginSuccessTip'),
      type: 'success',
    })
    navigate(RoutePath.overview)
  }

  useEffect(() => {
    const { token } = useUserStore.getState()
    if (token) {
      navigate(RoutePath.overview)
    }
  }, [navigate])

  const getErrorTip = (): string => {
    if (!isValidEmail(email)) return t('login.emailTip')
    if (!isValidPassword(password)) return t('login.passwordTip')
    return ''
  }

  const getEyeOffset = () => {
    if (authStatus === 'error')
      return { x: 0, y: 2, scale: 0.8, color: '#F87171' }

    if (focusedField === 'email') return { x: 5, y: -3, scale: 1 }
    if (focusedField === 'password') {
      return showPassword
        ? { x: 15, y: 1, scale: 1 }
        : { x: -15, y: 1, scale: 1 }
    }
    return { x: 0, y: 0, scale: 1 }
  }

  const eyePos = getEyeOffset()

  const characterBaseStyle = {
    transition: 'all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)',
    transformOrigin: 'bottom center',
  }

  const eyeStyle = {
    transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
    transform: `translate(${eyePos.x}px, ${eyePos.y}px) scale(${eyePos.scale})`,
    transformOrigin: 'center',
  }

  const getFillColor = (defaultColor: string) => {
    if (authStatus === 'error') return '#EF4444'
    return defaultColor
  }

  return (
    <div className={styles.login}>
      <div className={styles['left-panel']}>
        <div
          className={`${styles['character-container']} ${
            authStatus === 'error' ? styles['status-error'] : ''
          }`}
        >
          <svg
            viewBox="0 0 400 400"
            className={authStatus !== 'error' ? styles.svg : ''}
          >
            {/* 紫色角色 */}
            <g style={characterBaseStyle}>
              <rect
                x="100"
                y="80"
                width="80"
                height="240"
                fill={getFillColor('#6B21FF')}
                rx="8"
              />
              {authStatus === 'error' ? (
                <path
                  d="M135 110 L145 120 M145 110 L135 120"
                  stroke="#000"
                  strokeWidth="3"
                  style={eyeStyle}
                />
              ) : authStatus === 'success' ? (
                <path
                  d="M132 115 Q140 105 148 115"
                  fill="none"
                  stroke="#FFF"
                  strokeWidth="3"
                  style={eyeStyle}
                />
              ) : (
                <circle cx="140" cy="115" r="4" fill="#000" style={eyeStyle} />
              )}
            </g>

            {/* 黑色角色 */}
            <g style={characterBaseStyle}>
              <rect
                x="185"
                y="160"
                width="50"
                height="160"
                fill={
                  currentTheme === 'Light'
                    ? getFillColor('#1A1A1A')
                    : getFillColor('#eee')
                }
                rx="6"
              />
              <g style={eyeStyle}>
                <circle
                  cx="203"
                  cy="185"
                  r="4.5"
                  fill={currentTheme === 'Light' ? '#FFF' : '#000'}
                />
                <circle
                  cx="217"
                  cy="185"
                  r="4.5"
                  fill={currentTheme === 'Light' ? '#FFF' : '#000'}
                />
              </g>
            </g>

            {/* 黄色角色 */}
            <g style={characterBaseStyle}>
              <path
                d="M240 320 L240 220 A40 40 0 0 1 320 220 L320 320 Z"
                fill={getFillColor('#FDD835')}
              />
              <g style={eyeStyle}>
                <rect
                  x="255"
                  y="245"
                  width="10"
                  height="3"
                  fill="#000"
                  rx="1.5"
                />
                <rect
                  x="285"
                  y="245"
                  width="10"
                  height="3"
                  fill="#000"
                  rx="1.5"
                />
              </g>
              <rect
                x="250"
                y="265"
                width="50"
                height="3"
                fill="#000"
                rx="1.5"
              />
            </g>

            {/* 橙色角色 */}
            <g style={characterBaseStyle}>
              <path
                d="M40 320 A100 100 0 0 1 240 320 Z"
                fill={getFillColor('#FF7043')}
              />
              <g style={{ ...eyeStyle, transitionDelay: '0.03s' }}>
                <circle cx="120" cy="275" r="6" fill="#000" />
                <circle cx="160" cy="275" r="6" fill="#000" />
                <path
                  d={
                    authStatus === 'success'
                      ? 'M125 300 Q140 285 155 300'
                      : 'M125 290 Q140 305 155 290'
                  }
                  fill="none"
                  stroke="#000"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </g>
            </g>
          </svg>
        </div>
      </div>

      <div className={styles['right-panel']}>
        <div className={styles.tools}>
          <ThemeToggleBtn />
          <LanguageToggleBtn />
        </div>
        <div className={styles['form-wrapper']}>
          <div
            className={styles.logo}
            style={{
              color:
                authStatus === 'error'
                  ? '#EF4444'
                  : authStatus === 'success'
                    ? ''
                    : themeColor,
            }}
          >
            {authStatus === 'error'
              ? '✕'
              : authStatus === 'success'
                ? '✓'
                : '✦'}
          </div>
          <h1 className={styles.title}>
            {authStatus === 'success'
              ? '登录成功'
              : authStatus === 'error'
                ? t('login.titleError')
                : t('login.title')}
          </h1>
          <p
            className={`${styles.subtitle} ${
              authStatus === 'error' ? styles['status-error'] : ''
            }`}
          >
            {authStatus === 'error' ? getErrorTip() : 'Hi~ o(*￣▽￣*)ブ'}
          </p>

          <div className={styles['input-group']}>
            <label className={styles.label}>{t('login.email')}</label>
            <div
              className={styles['input-wrapper']}
              style={{
                borderBottomColor:
                  authStatus === 'error' ? '#EF4444' : '#E5E7EB',
              }}
            >
              <input
                type="email"
                placeholder="email@example.com"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
              />
              <div
                className={styles['focus-line']}
                style={{
                  width: focusedField === 'email' ? '100%' : '0%',
                  backgroundColor:
                    authStatus === 'error' ? '#EF4444' : themeColor,
                }}
              />
            </div>
          </div>

          <div className={styles['input-group']}>
            <label className={styles.label}>{t('login.password')}</label>
            <div
              className={styles['input-wrapper']}
              style={{
                borderBottomColor:
                  authStatus === 'error' ? '#EF4444' : '#E5E7EB',
              }}
            >
              <div className={styles['password-container']}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('login.passwordHint')}
                  className={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleLogin()
                    }
                  }}
                />
                <p
                  className={styles['eye-icon']}
                  style={{
                    color: showPassword ? themeColor : '#999',
                  }}
                  onClick={() => setShowPassword(!showPassword)}
                  title={
                    showPassword
                      ? t('login.hidePassword')
                      : t('login.displayPassword')
                  }
                >
                  {showPassword ? '( •̀ ω •́ )' : '( -_- )'}
                </p>
              </div>
              <div
                className={styles['focus-line']}
                style={{
                  width: focusedField === 'password' ? '100%' : '0%',
                  backgroundColor:
                    authStatus === 'error' ? '#EF4444' : themeColor,
                }}
              />
            </div>
          </div>

          <button
            className={styles['login-btn']}
            style={{
              backgroundColor:
                authStatus === 'error'
                  ? '#EF4444'
                  : authStatus === 'success'
                    ? '#22C55E'
                    : currentTheme === 'Light'
                      ? '#111827'
                      : '#eee',
            }}
            onClick={handleLogin}
          >
            {t('login.loginBtn')}
          </button>
        </div>
      </div>
    </div>
  )
}
