import { useStatusStore } from '@/stores'

export default function LanguageToggleBtn() {
  const currentLanguage = useStatusStore((state) => state.currentLanguage)
  const toggleLanguage = useStatusStore((state) => state.toggleLanguage)
  return (
    <>
      <div
        style={{
          userSelect: 'none',
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          cursor: 'pointer',
        }}
        title={currentLanguage === 'zh' ? 'switch to English' : '切换到英文'}
        onClick={toggleLanguage}
      >
        {currentLanguage === 'zh' ? 'EN' : '中'}
      </div>
    </>
  )
}
