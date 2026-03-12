import { useEffect, useState } from 'react'
import styles from '../userPermModify.module.scss'
import { useTranslation } from 'react-i18next'
import { Input, Modal, Switch } from 'antd'
import { Toast } from '@/utils'
import {
  addUserPermAPI,
  delUserPermAPI,
  setUserTempPunish2NullAPI,
} from '@/api'
import emitter from '@/utils/eventEmitter'

export default function UserPost({
  userId,
  hasPerm,
  currentEditUserId,
  until,
}: {
  userId: string
  hasPerm: boolean
  currentEditUserId: string
  until: number
}) {
  const { t } = useTranslation()

  const handleClick = () => {
    if (userId !== currentEditUserId) return
    setOpen(true)
  }

  useEffect(() => {
    if (userId !== currentEditUserId) return
  }, [userId, currentEditUserId])

  const [open, setOpen] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)

  const [cprVisible, setCprVisible] = useState(false)
  const [cancelPunishmentReason, setCancelPunishmentReason] = useState('')

  const [pprVisible, setPprVisible] = useState(false)
  const [permanentPunishmentReason, setPermanentPunishmentReason] = useState('')

  const [cpprVisible, setCpprVisible] = useState(false)
  const [cancelPmntPunishmentReason, setCancelPmntPunishmentReason] =
    useState('')

  const onClose = () => {
    setOpen(false)

    setCprVisible(false)
    setCancelPunishmentReason('')

    setPprVisible(false)
    setPermanentPunishmentReason('')

    setCpprVisible(false)
    setCancelPmntPunishmentReason('')
  }

  const handleOk = async () => {
    if (
      (hasPerm && until && !cprVisible && !pprVisible) ||
      ((hasPerm || until) && !cprVisible && !pprVisible) ||
      (!hasPerm && !cpprVisible)
    ) {
      Toast.show({
        msg: t('common.noChangeTip'),
        type: 'error',
      })
      return
    }

    try {
      // 取消暂时性禁止发帖
      if (cprVisible) {
        if (!cancelPunishmentReason) {
          Toast.show({
            msg: t('common.reasonInputErrorTip'),
            type: 'error',
          })
          return
        }
        setConfirmLoading(true)
        await setUserTempPunish2NullAPI({
          userId,
          prohibition: 'postProhibitUntil',
          reason: cancelPunishmentReason,
        })
      }

      // 永久禁止发帖
      if (pprVisible) {
        if (!permanentPunishmentReason) {
          Toast.show({
            msg: t('common.reasonInputErrorTip'),
            type: 'error',
          })
          return
        }
        setConfirmLoading(true)
        await delUserPermAPI({
          userId,
          permission: 'user_post',
          reason: permanentPunishmentReason,
        })
      }

      // 取消永久禁止发帖
      if (cpprVisible) {
        if (!cancelPmntPunishmentReason) {
          Toast.show({
            msg: t('common.reasonInputErrorTip'),
            type: 'error',
          })
          return
        }
        setConfirmLoading(true)
        await addUserPermAPI({
          userId,
          permission: 'user_post',
          reason: cancelPmntPunishmentReason,
        })
      }
      Toast.show({
        msg: t('common.successTip'),
        type: 'success',
      })

      emitter.emit('EVENT:UPDATE_USER_PERMS')
      onClose()
    } catch {
      Toast.show({
        msg: t('common.errorTip'),
        type: 'error',
      })
    } finally {
      setConfirmLoading(false)
    }
  }

  return (
    <>
      <div
        className={`${styles['common-label']} ${(!hasPerm || until !== 0) && styles['no-perm']} ${userId === currentEditUserId && styles['cursor']}`}
        style={{
          backgroundColor: 'rgb(235, 249, 245)',
          color: 'rgb(16, 185, 129)',
        }}
        onClick={handleClick}
      >
        {until ? t('userPermModify.prohibitPost') : t('userPermModify.post')}
        {until !== 0 && ' ' + until + ' min'}
      </div>
      <Modal
        title={
          !hasPerm
            ? t('userPermModify.postErrorTip')
            : until !== 0
              ? t('userPermModify.postTempTip') + `${until} min`
              : t('userPermModify.postNormalTip')
        }
        open={open}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={onClose}
        centered
        okText={t('common.save')}
        cancelText={t('common.cancel')}
      >
        {/* 取消暂时性禁止发帖 */}
        {hasPerm && until !== 0 && (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                margin: '10px 0',
                justifyContent: 'space-between',
              }}
            >
              <p>{t('userPermModify.removeTempProhibitPostTip')}</p>
              <Switch
                value={cprVisible}
                onChange={(status: boolean) => {
                  if (pprVisible) {
                    setPprVisible(false)
                  }
                  setCprVisible(status)
                }}
              />
            </div>
            {cprVisible && (
              <Input
                value={cancelPunishmentReason}
                onChange={(e) => setCancelPunishmentReason(e.target.value)}
                placeholder={t('common.reason')}
              />
            )}
          </>
        )}
        {/* 永久禁止发帖 */}
        {(hasPerm || until !== 0) && (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                margin: '10px 0',
                justifyContent: 'space-between',
              }}
            >
              <p>{t('userPermModify.permanentProhibitPostTip')}</p>
              <Switch
                value={pprVisible}
                onChange={(status: boolean) => {
                  if (cprVisible) {
                    setCprVisible(false)
                  }
                  setPprVisible(status)
                }}
              />
            </div>
            {pprVisible && (
              <Input
                value={permanentPunishmentReason}
                onChange={(e) => setPermanentPunishmentReason(e.target.value)}
                placeholder={t('common.reason')}
              />
            )}
          </>
        )}
        {/* 取消永久禁止发帖 */}
        {!hasPerm && (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                margin: '10px 0',
                justifyContent: 'space-between',
              }}
            >
              <p>{t('userPermModify.removeProhibitPostTip')}</p>
              <Switch
                value={cpprVisible}
                onChange={(status: boolean) => setCpprVisible(status)}
              />
            </div>
            {cpprVisible && (
              <Input
                value={cancelPmntPunishmentReason}
                onChange={(e) => setCancelPmntPunishmentReason(e.target.value)}
                placeholder={t('common.reason')}
              />
            )}
          </>
        )}
      </Modal>
    </>
  )
}
