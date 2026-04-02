import { describe, expect, it, vi } from 'vitest'
import { Toast } from '../toast'

describe('弹窗功能', () => {
  it('仅文字提示', () => {
    const mockShow = vi.fn()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(Toast as any).toast = {
      show: mockShow,
    }

    Toast.show({
      msg: 'hello',
      type: 'success',
    })

    expect(mockShow).toHaveBeenCalledWith({
      msg: 'hello',
      type: 'success',
      duration: 2000,
      confirmText: '确认',
    })
  })

  it('文字提示 + 是否确认操作', () => {
    const mockShow = vi.fn()
    const eventFn = vi.fn()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(Toast as any).toast = {
      show: mockShow,
    }

    Toast.show({
      msg: '未登录，是否登录',
      type: 'error',
      eventFn,
    })

    expect(mockShow).toHaveBeenCalledWith({
      msg: '未登录，是否登录',
      type: 'error',
      duration: 2000,
      eventFn,
      confirmText: '确认',
    })
  })
})
