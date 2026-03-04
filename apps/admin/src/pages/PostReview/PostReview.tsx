import {
  createViolationReasonAPI,
  getUnreviewPostAPI,
  updatePostStatusAPI,
} from '@/api'
import type { PostDetail } from '@forum-monorepo/types'
import { useEffect, useState } from 'react'
import {
  Table,
  Image,
  type TableProps,
  Typography,
  Drawer,
  Button,
  Modal,
  Input,
} from 'antd'
import { useTranslation } from 'react-i18next'
import emitter from '@/utils/eventEmitter'
import { Toast } from '@/utils'

interface DataType {
  key: number
  postId: string
  pContent: string
  pImages: string[]
}

function ContentCell({ text }: { text: string }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <>
      <Typography.Paragraph
        ellipsis={{ rows: 2 }}
        style={{ marginBottom: 0, cursor: 'pointer' }}
        onClick={() => setOpen(true)}
      >
        {text}
      </Typography.Paragraph>

      <Drawer open={open} size={600} onClose={() => setOpen(false)}>
        <h2>{t('postReview.postContent')}</h2>
        <br />
        <div style={{ whiteSpace: 'pre-wrap' }}>{text}</div>
      </Drawer>
    </>
  )
}

function PassButton({ postId }: { postId: string }) {
  const { t } = useTranslation()

  const [open, setOpen] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)

  const showModal = () => {
    setOpen(true)
  }

  const handleOk = async () => {
    setConfirmLoading(true)
    await updatePostStatusAPI({ postId, status: 1 })
    setConfirmLoading(false)
    setOpen(false)
    Toast.show({
      msg: t('postReview.successTip'),
      type: 'success',
    })
    emitter.emit('EVENT:UPDATE_POST_REVIEW')
  }

  const handleCancel = () => {
    setOpen(false)
  }

  return (
    <>
      <Button color="cyan" variant="solid" onClick={showModal}>
        {t('postReview.pass')}
      </Button>
      <Modal
        open={open}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
        centered
      >
        <p>{t('postReview.isPass')}</p>
      </Modal>
    </>
  )
}

function ViolateButton({ postId }: { postId: string }) {
  const { t } = useTranslation()

  const [open, setOpen] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [value, setValue] = useState('')

  const handleOk = async () => {
    setConfirmLoading(true)
    if (value.trim() === '') {
      Toast.show({
        msg: t('postReview.reasonInputErrorTip'),
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
    setConfirmLoading(false)
    setOpen(false)
    Toast.show({
      msg: t('postReview.successTip'),
      type: 'success',
    })
    emitter.emit('EVENT:UPDATE_POST_REVIEW')
  }

  return (
    <>
      <Button danger onClick={() => setOpen(true)}>
        {t('postReview.violate')}
      </Button>
      <Modal
        title={t('postReview.inputReasonTip')}
        open={open}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={() => setOpen(false)}
        centered
      >
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t('postReview.reason')}
        />
      </Modal>
    </>
  )
}

export default function PostReview() {
  const { t } = useTranslation()

  const columns: TableProps<DataType>['columns'] = [
    {
      title: t('postReview.content'),
      dataIndex: 'pContent',
      key: 'pContent',
      render: (text: string) => <ContentCell text={text} />,
    },
    {
      title: t('postReview.images'),
      dataIndex: 'pImages',
      key: 'pImages',
      render: (images?: string[]) => {
        if (!images?.length) return '-'

        return (
          <Image.PreviewGroup>
            {images.map((url, i) => (
              <Image
                key={i}
                src={url}
                width={40}
                height={40}
                style={{
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
              />
            ))}
          </Image.PreviewGroup>
        )
      },
    },
    {
      title: t('postReview.action'),
      dataIndex: 'postId',
      key: 'action',
      render: (postId: string) => (
        <div
          style={{
            display: 'flex',
            gap: '5px',
          }}
        >
          <PassButton postId={postId} />
          <ViolateButton postId={postId} />
          &nbsp;
        </div>
      ),
    },
  ]

  const [postList, setPostList] = useState<DataType[]>()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    let ignore = false

    async function getUnreviewPost() {
      const res = await getUnreviewPostAPI(page, pageSize)
      const data: PostDetail[] = res.data.data.list
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
          postId: item.pId,
          pContent: item.pContent,
          pImages: item.pImages,
        })
      )

      if (!ignore) {
        setPostList(filterData)
      }
    }

    getUnreviewPost()

    const off = emitter.on('EVENT:UPDATE_POST_REVIEW', () => {
      // if(postList?.length === 0) {
      // setPage()
      // }
      getUnreviewPost()
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
        dataSource={postList}
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
