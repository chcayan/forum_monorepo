import { useEffect, useState } from 'react'
import styles from '../userPermModify.module.scss'
import emitter from '@/utils/eventEmitter'
import { addAdminPermAPI, delAdminPermAPI } from '@/api'
import { useTranslation } from 'react-i18next'

export default function ReportReview({
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
    if (userId !== currentEditUserId) return
    setPerm(!perm)
  }

  useEffect(() => {
    if (userId !== currentEditUserId) return

    const off = emitter.on(
      'EVENT:RECOVER_REPORT_REVIEW_PERM',
      (hasPerm: boolean) => {
        setPerm(hasPerm)
      }
    )

    const off1 = emitter.on('EVENT:SAVE_REPORT_REVIEW_PERM', () => {
      if (hasPerm !== perm) {
        if (perm === true) {
          addAdminPermAPI({ userId, permission: 'report_review' }).catch(() => {
            setPerm(hasPerm)
          })
        } else if (perm === false) {
          delAdminPermAPI({ userId, permission: 'report_review' }).catch(() => {
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
        className={`${styles['common-label']} ${!perm && styles['no-perm']} ${userId === currentEditUserId && styles['cursor']}`}
        style={{
          backgroundColor: 'rgb(235, 249, 245)',
          color: 'rgb(16, 185, 129)',
        }}
        onClick={handleClick}
      >
        {t('userPermModify.reportReview')}
      </div>
    </>
  )
}
