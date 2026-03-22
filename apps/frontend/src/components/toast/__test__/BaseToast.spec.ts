import { mount } from '@vue/test-utils'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import BaseToast from '../BaseToast.vue'

describe('Base toast', () => {
  beforeAll(() => {
    Element.prototype.animate = vi.fn()
  })

  it('仅文字 toast', async () => {
    const wrapper = mount(BaseToast)

    wrapper.vm.show({
      msg: '登录成功',
      type: 'success',
      duration: 2000,
    })

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('登录成功')
  })

  it('自动关闭 toast', async () => {
    vi.useFakeTimers()

    const wrapper = mount(BaseToast)

    wrapper.vm.show({
      msg: 'what can i say!',
      type: 'normal',
    })

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('what can i say!')

    vi.advanceTimersByTime(2000)

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('拜拜😊')

    vi.useRealTimers()
  })

  it('包含确认按钮', async () => {
    vi.useFakeTimers()

    const wrapper = mount(BaseToast)

    const fn = vi.fn()

    wrapper.vm.show({
      msg: '咕咕嘎嘎？',
      type: 'error',
      duration: 3000,
      eventFn: fn,
    })

    await wrapper.vm.$nextTick()

    expect(wrapper.find('button').exists()).toBe(true)

    expect(wrapper.text()).toContain('3')

    vi.useRealTimers()
  })

  it('点击确认按钮后触发事件', async () => {
    const wrapper = mount(BaseToast)
    const fn = vi.fn()

    wrapper.vm.show({
      msg: '点我',
      type: 'error',
      duration: 3000,
      eventFn: fn,
    })

    await wrapper.vm.$nextTick()

    await wrapper.find('button').trigger('click')

    expect(fn).toHaveBeenCalled()
  })

  it('倒计时结束后隐藏 toast', async () => {
    vi.useFakeTimers()

    const wrapper = mount(BaseToast)

    wrapper.vm.show({
      msg: '倒计时',
      type: 'normal',
      duration: 2000,
      eventFn: vi.fn(),
    })

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('2')

    vi.advanceTimersByTime(1000)
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('1')

    vi.advanceTimersByTime(1000)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('button').exists()).toBe(false)

    vi.useRealTimers()
  })
})
