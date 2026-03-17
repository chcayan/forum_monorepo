import { useTranslation } from 'react-i18next'
import styles from './overview.module.scss'
import { useEffect, useState } from 'react'
import { getOverviewDataAPI } from '@/api'

type OverviewData = {
  postReviewCount: number
  postReportCount: number
  commentReportCount: number
}

export default function Overview() {
  const { t } = useTranslation()

  const [data, setData] = useState<OverviewData>()

  useEffect(() => {
    let ignore = false

    async function getData() {
      const res = await getOverviewDataAPI()

      if (!ignore) {
        setData(res.data.data)
      }
    }

    getData()
    return () => {
      ignore = true
    }
  }, [])

  return (
    <>
      <div className={styles.overview}>
        <h2 className={styles.h2}>{t('overview.title')}</h2>
        <ul className={styles.ul}>
          <li className={styles.li}>
            <p className={styles.p}>{t('overview.postReviewCount')}</p>
            <p className={styles.count}>{data?.postReviewCount || 0}</p>
          </li>
          <li className={styles.li}>
            <p className={styles.p}>{t('overview.postReportCount')}</p>
            <p className={styles.count}>{data?.postReportCount || 0}</p>
          </li>
          <li className={styles.li}>
            <p className={styles.p}>{t('overview.commentReportCount')}</p>
            <p className={styles.count}>{data?.commentReportCount || 0}</p>
          </li>
        </ul>
      </div>
    </>
  )
}
