import {
  createViolationReasonAPI,
  deletePostReportAPI,
  getPostDetailAPI,
  getPostReportReasonAPI,
  updatePostStatusAPI,
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
} from 'antd'
import { useTranslation } from 'react-i18next'
import emitter from '@/utils/eventEmitter'
import { Toast } from '@/utils'
import type { PostDetail } from '@forum-monorepo/types'

interface DataType {
  key: number
  id: number
  postId: string
  reason: string
}

interface ReportType {
  id: number
  pId: string
  reportReason: string
  createdAt: Date
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

function PassButton({
  id,
  postId,
  reason,
}: {
  id: number
  postId: string
  reason: string
}) {
  const { t } = useTranslation()

  const [open, setOpen] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [value, setValue] = useState(reason)

  const handleOk = async () => {
    setConfirmLoading(true)
    if (value.trim() === '') {
      Toast.show({
        msg: t('postReportReview.reasonInputErrorTip'),
        type: 'error',
      })
      setConfirmLoading(false)
      return
    }
    await updatePostStatusAPI({ postId, status: 2 })
    await createViolationReasonAPI({
      postId,
      reason: value,
    })
    await deletePostReportAPI(id)
    setConfirmLoading(false)
    setOpen(false)
    Toast.show({
      msg: t('postReportReview.successTip'),
      type: 'success',
    })
    emitter.emit('EVENT:UPDATE_POST_REPORT')
  }

  return (
    <>
      <Button color="cyan" variant="solid" onClick={() => setOpen(true)}>
        {t('postReportReview.pass')}
      </Button>
      <Modal
        title={t('postReportReview.inputReasonTip')}
        open={open}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={() => setOpen(false)}
        centered
      >
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t('postReportReview.reason')}
        />
      </Modal>
    </>
  )
}

function RejectButton({ id }: { id: number }) {
  const { t } = useTranslation()

  const [open, setOpen] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)

  const handleOk = async () => {
    setConfirmLoading(true)
    await deletePostReportAPI(id)
    setConfirmLoading(false)
    setOpen(false)
    Toast.show({
      msg: t('postReportReview.successTip'),
      type: 'success',
    })
    emitter.emit('EVENT:UPDATE_POST_REPORT')
  }

  const handleCancel = () => {
    setOpen(false)
  }

  return (
    <>
      <Button danger onClick={() => setOpen(true)}>
        {t('postReportReview.reject')}
      </Button>

      <Modal
        open={open}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
        centered
      >
        <p>{t('postReportReview.isReject')}</p>
      </Modal>
    </>
  )
}

export default function PostReportReview() {
  const { t } = useTranslation()

  const columns: TableProps<DataType>['columns'] = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: t('postReportReview.postId'),
      dataIndex: 'postId',
      key: 'postId',
      render: (postId: string) => <PostCell postId={postId} />,
    },
    {
      title: t('postReportReview.ReportReason'),
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: t('postReportReview.action'),
      dataIndex: 'id',
      key: 'action',
      render: (id: number, record: DataType) => (
        <div
          style={{
            display: 'flex',
            gap: '5px',
          }}
        >
          <PassButton id={id} postId={record.postId} reason={record.reason} />
          <RejectButton id={id} />
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
          id: item.id,
          postId: item.pId,
          reason: item.reportReason,
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
