import { useStatusStore } from '@/stores'
import LightSvg from '../svg/LightSvg'
import DarkSvg from '../svg/DarkSvg'

export default function ThemeToggleBtn() {
  const currentTheme = useStatusStore((state) => state.currentTheme)
  const toggleTheme = useStatusStore((state) => state.toggleTheme)
  return (
    <>
      <div
        tabIndex={0}
        className="tab-focus-style toggle-btn"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            toggleTheme()
          }
        }}
        onClick={toggleTheme}
        style={{
          cursor: 'pointer',
        }}
      >
        {currentTheme === 'Light' ? <LightSvg /> : <DarkSvg />}
      </div>
    </>
  )
}
