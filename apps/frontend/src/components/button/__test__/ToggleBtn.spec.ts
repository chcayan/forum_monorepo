import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ToggleBtn from '../ToggleBtn.vue'
describe('ToggleButton', () => {
  it('status = true 时不应该有 toggle-active', () => {
    const wrapper = mount(ToggleBtn, {
      props: {
        status: true,
      },
    })

    expect(wrapper.classes()).not.toContain('toggle-active')
  })

  it('status=false 时应该有 toggle-active', () => {
    const wrapper = mount(ToggleBtn, {
      props: {
        status: false,
      },
    })

    expect(wrapper.classes()).toContain('toggle-active')
  })

  it('应该正确渲染默认 slot', () => {
    const wrapper = mount(ToggleBtn)

    expect(wrapper.text()).toContain('按钮1')
    expect(wrapper.text()).toContain('按钮2')
  })

  it('应该渲染自定义 slot', () => {
    const wrapper = mount(ToggleBtn, {
      slots: {
        first: '开',
        second: '关',
      },
    })

    expect(wrapper.text()).toContain('开')
    expect(wrapper.text()).toContain('关')
  })

  it('class 逻辑正确（动态更新）', async () => {
    const wrapper = mount(ToggleBtn, {
      props: { status: true },
    })

    await wrapper.setProps({ status: false })

    expect(wrapper.classes()).toContain('toggle-active')
  })
})
