import { useTranslation } from 'react-i18next'

export default function Overview() {
  const { t } = useTranslation()
  return (
    <>
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '50px',
          fontWeight: 'bold',
        }}
      >
        {t('overview.title')}
      </div>
    </>
  )
}
