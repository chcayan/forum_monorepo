import { Input, Pagination } from 'antd'
import styles from './userPermModify.module.scss'
import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { getUserPermsAPI } from '@/api'
import PostReview from './components/PostReview'
import emitter from '@/utils/eventEmitter'
import { Toast } from '@/utils'
import ReportReview from './components/ReportReview'
import PermModify from './components/PermModify'
import { useTranslation } from 'react-i18next'
import UserSpeak from './components/UserSpeak'
import UserPost from './components/UserPost'
import UserLogin from './components/UserLogin'
import { useUserStore } from '@/stores'

type UserPermsInfo = {
  userId: string
  username: string
  avatar: string
  email: string
  hasUserSpeakPerm: boolean
  hasUserPostPerm: boolean
  hasUserLoginPerm: boolean
  hasPostReviewPerm: boolean
  hasReportReviewPerm: boolean
  hasUserPermModifyPerm: boolean
  muteUntil: number
  postProhibitUntil: number
  loginProhibitUntil: number
}

export default function UserPermModify() {
  const { t } = useTranslation()
  const [list, setList] = useState<UserPermsInfo[]>()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(9)
  const [total, setTotal] = useState(0)
  const [userId, setUserId] = useState('')

  const adminId = useUserStore((state) => state.userInfo.userId)

  useEffect(() => {
    let ignore = false

    async function getUserPerms() {
      const res = await getUserPermsAPI(page, pageSize)
      const data: UserPermsInfo[] = res.data.data.list
      const total = res.data.data.total

      const filteredData = data.filter(
        (item) => item.userId !== adminId && item.userId !== 'u00000'
      )

      setTotal(total)
      if (!ignore) {
        setList(filteredData)
      }
    }

    getUserPerms()

    const off = emitter.on('EVENT:UPDATE_USER_PERMS', async () => {
      await getUserPerms()
      setUserId('')
    })

    return () => {
      ignore = true
      off()
    }
  }, [adminId, page, pageSize])

  const onEdit = (userId: string) => {
    setUserId(userId)
  }

  const save = async () => {
    await emitter.emitAsync('EVENT:SAVE_POST_REVIEW_PERM')
    await emitter.emitAsync('EVENT:SAVE_REPORT_REVIEW_PERM')
    await emitter.emitAsync('EVENT:SAVE_USER_PERM_MODIFY_PERM')
    await emitter.emitAsync('EVENT:UPDATE_USER_PERMS')
    Toast.show({
      msg: t('common.successTip'),
      type: 'success',
    })
  }

  const cancel = async () => {
    await emitter.emitAsync('EVENT:RECOVER_POST_REVIEW_PERM')
    await emitter.emitAsync('EVENT:RECOVER_REPORT_REVIEW_PERM')
    await emitter.emitAsync('EVENT:RECOVER_USER_PERM_MODIFY_PERM')
    setUserId('')
  }

  const [value, setValue] = useState('')

  const timer = useRef<number | null>(null)

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    if ((e.nativeEvent as InputEvent).isComposing) return

    const value = e.target.value
    setValue(value)
    if (timer.current) {
      clearTimeout(timer.current)
    }

    timer.current = setTimeout(() => {
      console.log(value)
      // TODO search
    }, 300)
  }

  return (
    <>
      <div className={styles.user}>
        <header className={styles.header}>
          <Input
            placeholder={t('userPermModify.searchTip')}
            size={'large'}
            value={value}
            onChange={(e) => onChange(e)}
          />
        </header>
        <main className={styles.main}>
          {list?.map((item) => (
            <div className={styles.item} key={item.userId}>
              <div className={styles.head}>
                <img className={styles.avatar} src={item.avatar} alt="avatar" />
                <div className={styles.info}>
                  <p className={styles.name}>{item.username}</p>
                  <p className={styles.email}>
                    {item.email}
                    {item.userId === 'u00000'
                      ? ` · ${t('userPermModify.defaultAdmin')}`
                      : item.hasPostReviewPerm ||
                          item.hasReportReviewPerm ||
                          item.hasUserPermModifyPerm
                        ? ` · ${t('userPermModify.admin')}`
                        : ''}
                  </p>
                </div>
              </div>
              <div className={styles.perm}>
                <p className={styles.content}>{t('userPermModify.userPerm')}</p>
                <div className={styles['user-perm']}>
                  <UserSpeak
                    userId={item.userId}
                    hasPerm={item.hasUserSpeakPerm}
                    currentEditUserId={userId}
                    until={item.muteUntil}
                  />
                  <UserPost
                    userId={item.userId}
                    hasPerm={item.hasUserPostPerm}
                    currentEditUserId={userId}
                    until={item.postProhibitUntil}
                  />
                  <UserLogin
                    userId={item.userId}
                    hasPerm={item.hasUserLoginPerm}
                    currentEditUserId={userId}
                    until={item.loginProhibitUntil}
                  />
                </div>
                <div style={{ height: '10px' }}></div>
                <p className={styles.content}>
                  {t('userPermModify.adminPerm')}
                </p>
                <div className={styles['admin-perm']}>
                  <PostReview
                    userId={item.userId}
                    hasPerm={item.hasPostReviewPerm}
                    currentEditUserId={userId}
                  />
                  <ReportReview
                    userId={item.userId}
                    hasPerm={item.hasReportReviewPerm}
                    currentEditUserId={userId}
                  />
                  <PermModify
                    userId={item.userId}
                    hasPerm={item.hasUserPermModifyPerm}
                    currentEditUserId={userId}
                  />
                </div>
              </div>
              <div className={styles.edit}>
                {userId === item.userId ? (
                  <div className={styles.modify}>
                    <button
                      className={`${styles.btn} ${styles.save}`}
                      onClick={save}
                    >
                      {t('common.save')}
                    </button>
                    <button className={styles.btn} onClick={() => cancel()}>
                      {t('common.cancel')}
                    </button>
                  </div>
                ) : (
                  <button
                    className={styles.btn}
                    onClick={() => onEdit(item.userId)}
                  >
                    {t('common.edit')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </main>
        <footer className={styles.footer}>
          <Pagination
            defaultCurrent={1}
            total={total}
            showSizeChanger={true}
            pageSize={pageSize}
            pageSizeOptions={[9, 18, 27, 36, 45]}
            onShowSizeChange={(_, size) => {
              setPageSize(size)
            }}
            onChange={(page, pageSize) => {
              setPage(page)
              setPageSize(pageSize)
            }}
          />
        </footer>
      </div>
    </>
  )
}
