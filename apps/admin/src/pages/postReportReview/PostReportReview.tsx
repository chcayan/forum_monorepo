import {
  deletePostReportAPI,
  getPostDetailAPI,
  getPostReportReasonAPI,
  setPostViolateAPI,
  setUserPermProhibitTimeAPI,
} from '@/api'
import { useEffect, useState } from 'react'
import {
  Table,
  Image,
  type TableProps,
  Drawer,
  Button,
  Modal,
  Input,
  Space,
  Switch,
  Radio,
  type RadioChangeEvent,
} from 'antd'
import { useTranslation } from 'react-i18next'
import emitter from '@/utils/eventEmitter'
import { Toast } from '@/utils'
import type { PostDetail } from '@forum-monorepo/types'
import type { CheckboxGroupProps } from 'antd/es/checkbox'

interface DataType {
  key: number
  postId: string
  userId: string
  reasons: string[]
}

interface ReportType {
  postId: string
  userId: string
  reasons: string[]
}

function PostCell({ postId }: { postId: string }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const [post, setPost] = useState<PostDetail>()

  useEffect(() => {
    async function getPostDetail() {
      const res = await getPostDetailAPI(postId)
      const data = res.data.data
      setPost(data)
    }

    getPostDetail()
  }, [postId])

  return (
    <>
      <p style={{ cursor: 'pointer' }} onClick={() => setOpen(true)}>
        {postId}
      </p>
      <Drawer open={open} size={600} onClose={() => setOpen(false)}>
        <h2>{t('postReportReview.postInfo')}</h2>
        <br />
        <div>{post?.pContent}</div>
        <br />
        <Image.PreviewGroup>
          <Space size={8} wrap>
            {post?.pImages.map((url, i) => (
              <Image
                key={i}
                src={url}
                width={100}
                height={100}
                style={{
                  objectFit: 'cover',
                }}
              />
            ))}
          </Space>
        </Image.PreviewGroup>
      </Drawer>
    </>
  )
}

function PassButton({ postId, userId }: { postId: string; userId: string }) {
  const { t } = useTranslation()

  const [open, setOpen] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [value, setValue] = useState('')

  const handleOk = async () => {
    if (value.trim() === '') {
      Toast.show({
        msg: t('common.reasonInputErrorTip'),
        type: 'error',
      })
      return
    }
    setConfirmLoading(true)
    try {
      await setPostViolateAPI({
        postId,
        status: 2,
        reason: value,
        punishTime: forbiddenTimeRadioVisible ? timeValue : 0,
      })
      if (forbiddenTimeRadioVisible) {
        await setUserPermProhibitTimeAPI({
          userId,
          prohibition: 'postProhibitUntil',
          hours: timeValue,
          reason: value,
          punishTime: timeValue,
          postId,
        })
      }
      await deletePostReportAPI(postId)
      onClose()
      Toast.show({
        msg: t('common.successTip'),
        type: 'success',
      })
      emitter.emit('EVENT:UPDATE_POST_REPORT')
    } catch {
      Toast.show({
        msg: t('common.errorTip'),
        type: 'error',
      })
    } finally {
      setConfirmLoading(false)
    }
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
        {t('common.pass')}
      </Button>
      <Modal
        title={t('common.inputReasonTip')}
        open={open}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={onClose}
        centered
      >
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t('common.reason')}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            margin: '10px 0',
            justifyContent: 'space-between',
          }}
        >
          <p>{t('postReportReview.prohibitPublishPostHint')}</p>
          <Switch value={forbiddenTimeRadioVisible} onChange={onChange} />
        </div>
        {forbiddenTimeRadioVisible && (
          <>
            <p style={{ marginBottom: '10px' }}>{t('common.duration')}</p>
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

function RejectButton({ postId }: { postId: string }) {
  const { t } = useTranslation()

  const [open, setOpen] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)

  const handleOk = async () => {
    setConfirmLoading(true)
    try {
      await deletePostReportAPI(postId)
      setOpen(false)
      Toast.show({
        msg: t('common.successTip'),
        type: 'success',
      })
      emitter.emit('EVENT:UPDATE_POST_REPORT')
    } catch {
      Toast.show({
        msg: t('common.errorTip'),
        type: 'error',
      })
    } finally {
      setConfirmLoading(false)
    }
  }

  const handleCancel = () => {
    setOpen(false)
  }

  return (
    <>
      <Button danger onClick={() => setOpen(true)}>
        {t('common.reject')}
      </Button>

      <Modal
        open={open}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
        centered
      >
        <p>{t('common.isReject')}</p>
      </Modal>
    </>
  )
}

export default function PostReportReview() {
  const { t } = useTranslation()

  const columns: TableProps<DataType>['columns'] = [
    {
      title: t('postReportReview.postId'),
      dataIndex: 'postId',
      key: 'postId',
      render: (postId: string) => <PostCell postId={postId} />,
    },
    {
      title: t('common.ReportReason'),
      dataIndex: 'reasons',
      key: 'reasons',
      render: (reasons: string[]) =>
        reasons.map((item, index) => (
          <ol key={index}>
            {/* <li>-&nbsp;&nbsp;{item}</li>
             */}
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
      title: t('common.action'),
      dataIndex: 'postId',
      key: 'action',
      render: (_, record: DataType) => (
        <div
          style={{
            display: 'flex',
            gap: '5px',
          }}
        >
          <PassButton postId={record.postId} userId={record.userId} />
          <RejectButton postId={record.postId} />
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
      const res = await getPostReportReasonAPI(page, pageSize)
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
          reasons: item.reasons,
          userId: item.userId,
        })
      )

      if (!ignore) {
        setReportList(filterData)
      }
    }

    getPortReportReason()

    const off = emitter.on('EVENT:UPDATE_POST_REPORT', () => {
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
