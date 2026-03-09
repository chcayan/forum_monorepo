import {
  deleteCommentReportAPI,
  getCommentReportReasonAPI,
  setCommentViolateAPI,
  setUserPermProhibitTimeAPI,
} from '@/api'
import { useEffect, useState } from 'react'
import {
  Table,
  type TableProps,
  Button,
  Modal,
  Input,
  Switch,
  Radio,
  type RadioChangeEvent,
} from 'antd'
import { useTranslation } from 'react-i18next'
import emitter from '@/utils/eventEmitter'
import { Toast } from '@/utils'
import type { CheckboxGroupProps } from 'antd/es/checkbox'

interface DataType {
  key: number
  postId: string
  commentId: number
  userId: string
  reasons: string[]
}

interface ReportType {
  postId: string
  commentId: number
  userId: string
  reasons: string[]
}

function PassButton({
  postId,
  commentId,
  userId,
}: {
  postId: string
  commentId: number
  userId: string
}) {
  const { t } = useTranslation()

  const [open, setOpen] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [value, setValue] = useState('')

  const handleOk = async () => {
    setConfirmLoading(true)
    if (value.trim() === '') {
      Toast.show({
        msg: t('commentReportReview.reasonInputErrorTip'),
        type: 'error',
      })
      setConfirmLoading(false)
      return
    }
    await setCommentViolateAPI({
      postId,
      commentId,
      reason: value,
      punishTime: forbiddenTimeRadioVisible ? timeValue : 0,
    })
    if (forbiddenTimeRadioVisible) {
      await setUserPermProhibitTimeAPI({
        userId,
        prohibition: 'muteUntil',
        hours: timeValue,
        reason: value,
        punishTime: timeValue,
        postId,
        commentId,
      })
    }
    await deleteCommentReportAPI(commentId)
    setConfirmLoading(false)
    onClose()
    Toast.show({
      msg: t('commentReportReview.successTip'),
      type: 'success',
    })
    emitter.emit('EVENT:UPDATE_COMMENT_REPORT')
  }

  const onClose = () => {
    setOpen(false)
    setTimeValue(1)
    setForbiddenTimeRadioVisible(false)
    setValue('')
  }

  const [forbiddenTimeRadioVisible, setForbiddenTimeRadioVisible] =
    useState(false)
  const onChange = (status: boolean) => {
    setForbiddenTimeRadioVisible(status)
  }

  const [timeValue, setTimeValue] = useState<1 | 6 | 12 | 24>(1)

  const options: CheckboxGroupProps<number>['options'] = [
    { label: '1h', value: 1 },
    { label: '6h', value: 6 },
    { label: '12h', value: 12 },
    { label: '1d', value: 24 },
  ]

  const getTimeValue = (e: RadioChangeEvent) => {
    setTimeValue(e.target.value)
  }

  return (
    <>
      <Button color="cyan" variant="solid" onClick={() => setOpen(true)}>
        {t('commentReportReview.pass')}
      </Button>
      <Modal
        title={t('commentReportReview.inputReasonTip')}
        open={open}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={onClose}
        centered
      >
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t('commentReportReview.reason')}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            margin: '10px 0',
            justifyContent: 'space-between',
          }}
        >
          <p>{t('commentReportReview.prohibitSpeakHint')}</p>
          <Switch value={forbiddenTimeRadioVisible} onChange={onChange} />
        </div>
        {forbiddenTimeRadioVisible && (
          <>
            <p style={{ marginBottom: '10px' }}>
              {t('commentReportReview.duration')}
            </p>
            <Radio.Group
              block
              options={options}
              optionType="button"
              buttonStyle="solid"
              defaultValue={timeValue}
              onChange={getTimeValue}
            />
          </>
        )}
      </Modal>
    </>
  )
}

function RejectButton({ commentId }: { commentId: number }) {
  const { t } = useTranslation()

  const [open, setOpen] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)

  const handleOk = async () => {
    setConfirmLoading(true)
    await deleteCommentReportAPI(commentId)
    setConfirmLoading(false)
    setOpen(false)
    Toast.show({
      msg: t('commentReportReview.successTip'),
      type: 'success',
    })
    emitter.emit('EVENT:UPDATE_COMMENT_REPORT')
  }

  const handleCancel = () => {
    setOpen(false)
  }

  return (
    <>
      <Button danger onClick={() => setOpen(true)}>
        {t('commentReportReview.reject')}
      </Button>

      <Modal
        open={open}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
        centered
      >
        <p>{t('commentReportReview.isReject')}</p>
      </Modal>
    </>
  )
}

export default function CommentReportReview() {
  const { t } = useTranslation()

  const columns: TableProps<DataType>['columns'] = [
    {
      title: t('commentReportReview.commentId'),
      dataIndex: 'commentId',
      key: 'commentId',
    },
    {
      title: t('commentReportReview.ReportReason'),
      dataIndex: 'reasons',
      key: 'reasons',
      render: (reasons: string[]) =>
        reasons.map((item, index) => (
          <ol key={index}>
            <li style={{ display: 'flex', alignItems: 'flex-start' }}>
              <span
                style={{
                  marginRight: '6px',
                  fontWeight: 'bold',
                }}
              >
                -
              </span>
              <span style={{ flex: 1, minWidth: 0, wordBreak: 'break-word' }}>
                {item}
              </span>
            </li>
          </ol>
        )),
    },
    {
      title: t('commentReportReview.action'),
      dataIndex: 'postId',
      key: 'action',
      render: (_, record: DataType) => (
        <div
          style={{
            display: 'flex',
            gap: '5px',
          }}
        >
          <PassButton
            postId={record.postId}
            commentId={record.commentId}
            userId={record.userId}
          />
          <RejectButton commentId={record.commentId} />
          &nbsp;
        </div>
      ),
    },
  ]

  const [ReportList, setReportList] = useState<DataType[]>()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    let ignore = false

    async function getPortReportReason() {
      const res = await getCommentReportReasonAPI(page, pageSize)
      const data: ReportType[] = res.data.data.list
      const total = res.data.data.total

      setTotal(res.data.data.total)

      const maxPage = Math.max(1, Math.ceil(total / pageSize))

      if (page > maxPage) {
        setPage(maxPage)
        return
      }

      const filterData = data.map(
        (item, index): DataType => ({
          key: index,
          postId: item.postId,
          commentId: item.commentId,
          reasons: item.reasons,
          userId: item.userId,
        })
      )

      if (!ignore) {
        setReportList(filterData)
      }
    }

    getPortReportReason()

    const off = emitter.on('EVENT:UPDATE_COMMENT_REPORT', () => {
      getPortReportReason()
    })

    return () => {
      ignore = true
      off()
    }
  }, [page, pageSize])

  return (
    <>
      <Table<DataType>
        columns={columns}
        dataSource={ReportList}
        scroll={{
          y: 'calc(100vh - 220px)',
          x: '100%',
        }}
        pagination={{
          current: page,
          pageSize,
          total: total,
          showSizeChanger: true,
          onChange: (page, pageSize) => {
            setPage(page)
            setPageSize(pageSize)
          },
        }}
      />
    </>
  )
}
