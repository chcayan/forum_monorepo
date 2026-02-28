import { getUnAuditPostAPI } from '@/api'
import type { PostDetail } from '@forum-monorepo/types'
import { useEffect, useState } from 'react'
import { Table, Image, type TableProps, Typography, Drawer } from 'antd'
import { useTranslation } from 'react-i18next'

interface DataType {
  key: number
  pContent: string
  pImages: string[]
}

function ContentCell({ text }: { text: string }) {
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
        <div style={{ whiteSpace: 'pre-wrap' }}>{text}</div>
      </Drawer>
    </>
  )
}

export default function AuditPost() {
  const { t } = useTranslation()

  const columns: TableProps<DataType>['columns'] = [
    {
      title: t('auditPost.content'),
      dataIndex: 'pContent',
      key: 'pContent',
      render: (text: string) => <ContentCell text={text} />,
    },
    {
      title: t('auditPost.images'),
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
      title: t('auditPost.action'),
      key: 'action',
    },
  ]

  const [postList, setPostList] = useState<DataType[]>()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    let ignore = false

    async function getUnAuditPost() {
      const res = await getUnAuditPostAPI(page, pageSize)
      const data: PostDetail[] = res.data.data.list

      setTotal(res.data.data.total)
      const filterData = data.map(
        (item, index): DataType => ({
          key: index,
          pContent: item.pContent,
          pImages: item.pImages,
        })
      )

      if (!ignore) {
        setPostList(filterData)
      }
    }

    getUnAuditPost()

    return () => {
      ignore = true
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
