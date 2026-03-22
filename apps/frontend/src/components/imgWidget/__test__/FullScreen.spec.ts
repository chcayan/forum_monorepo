import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import FullScreen from '../FullScreen.vue'

const imgSrc = 'http://localhost:3000/test.jpg'
describe('图片全屏', () => {
  it('默认什么都没渲染', () => {
    const wrapper = mount(FullScreen)

    expect(wrapper.find('.shade').exists()).toBe(false)
  })

  it('点击图片后全屏显示图片', async () => {
    const wrapper = mount(FullScreen)

    const img = document.createElement('img')
    img.src = imgSrc

    wrapper.vm.onFullScreen(img)

    await wrapper.vm.$nextTick()

    const imageEl = wrapper.find('img')
    expect(imageEl.exists()).toBe(true)
    expect(imageEl.attributes('src')).toBe(imgSrc)
  })

  it('点击图片外遮罩退出全屏', async () => {
    const wrapper = mount(FullScreen)

    const img = document.createElement('img')
    img.src = imgSrc

    wrapper.vm.onFullScreen(img)
    await wrapper.vm.$nextTick()

    await wrapper.find('.shade').trigger('click')

    expect(wrapper.find('.shade').exists()).toBe(false)
  })

  it('点击图片不退出全屏', async () => {
    const wrapper = mount(FullScreen)

    const img = document.createElement('img')
    img.src = imgSrc

    wrapper.vm.onFullScreen(img)
    await wrapper.vm.$nextTick()

    await wrapper.find('img').trigger('click')

    expect(wrapper.find('.shade').exists()).toBe(true)
  })

  it('wheel 事件被阻止', async () => {
    const wrapper = mount(FullScreen)

    const img = document.createElement('img')
    wrapper.vm.onFullScreen(img)

    const event = new WheelEvent('wheel', { cancelable: true })

    const preventDefault = vi.spyOn(event, 'preventDefault')
    const stopPropagation = vi.spyOn(event, 'stopPropagation')

    document.body.dispatchEvent(event)

    expect(preventDefault).toHaveBeenCalled()
    expect(stopPropagation).toHaveBeenCalled()
  })

  it('退出时移除事件监听', async () => {
    const wrapper = mount(FullScreen)

    const img = document.createElement('img')
    wrapper.vm.onFullScreen(img)
    await wrapper.vm.$nextTick()

    const removeSpy = vi.spyOn(document.body, 'removeEventListener')

    await wrapper.find('.shade').trigger('click')

    expect(removeSpy).toHaveBeenCalledWith('wheel', expect.any(Function))
  })
})
