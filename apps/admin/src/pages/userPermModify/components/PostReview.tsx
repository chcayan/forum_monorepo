import { useEffect, useState } from 'react'
import styles from '../userPermModify.module.scss'
import emitter from '@/utils/eventEmitter'
import { addAdminPermAPI, delAdminPermAPI } from '@/api'
import { useTranslation } from 'react-i18next'

export default function PostReview({
  userId,
  hasPerm,
  currentEditUserId,
}: {
  userId: string
  hasPerm: boolean
  currentEditUserId: string
}) {
  const { t } = useTranslation()
  const [perm, setPerm] = useState(hasPerm)

  const handleClick = () => {
    if (!currentEditUserId) return
    setPerm(!perm)
  }

  useEffect(() => {
    if (userId !== currentEditUserId) return

    const off = emitter.on(
      'EVENT:RECOVER_POST_REVIEW_PERM',
      (hasPerm: boolean) => {
        setPerm(hasPerm)
      }
    )

    const off1 = emitter.on('EVENT:SAVE_POST_REVIEW_PERM', () => {
      if (hasPerm !== perm) {
        if (perm === true) {
          addAdminPermAPI({ userId, permission: 'post_review' }).catch(() => {
            setPerm(hasPerm)
          })
        } else if (perm === false) {
          delAdminPermAPI({ userId, permission: 'post_review' }).catch(() => {
            setPerm(hasPerm)
          })
        }
      }
    })

    return () => {
      off()
      off1()
    }
  }, [userId, currentEditUserId, hasPerm, perm])

  return (
    <>
      <div
        className={`${styles['common-label']} ${!perm && styles['no-perm']}`}
        style={{
          backgroundColor: 'rgb(239, 245, 254)',
          color: 'rgb(91, 149, 246)',
        }}
        onClick={handleClick}
      >
        {t('userPermModify.postReview')}
      </div>
    </>
  )
}
