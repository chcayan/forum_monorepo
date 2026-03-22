import { mount } from '@vue/test-utils'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import ChatToast from '../ChatToast.vue'

const avatarUrl = 'http://localhost:3000/test.jpg'
const bgImgUrl = 'http://localhost:3000/bgImg.jpg'

const defaultUserInfo = {
  userId: 'u00000',
  username: 'chcaya',
  userAvatar: avatarUrl,
  userEmail: 'chcaya@forum.com',
  registration: '2026-3-22',
  follows: '10086',
  fans: '666',
  backgroundImg: bgImgUrl,
  sex: 'boy',
  signature: 'what can i say!',
}

describe('Chat toast', () => {
  vi.mock('@/utils', () => ({
    socket: {
      emit: vi.fn(),
    },
    lineBreakReplace: (v: string) => v,
  }))

  vi.mock('@/api', () => ({
    markAsReadAPI: vi.fn(() => Promise.resolve()),
  }))

  vi.mock('@/router', () => ({
    default: {
      push: vi.fn(),
    },
    RouterPath: {
      chat: '/chat',
    },
  }))

  vi.mock('@/stores', () => ({
    useUserStore: () => ({
      userInfo: defaultUserInfo,
    }),
    useTempStore: () => ({
      setTempUserInfo: vi.fn(),
    }),
  }))

  beforeAll(() => {
    Element.prototype.animate = vi.fn()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('显示用户消息', async () => {
    const wrapper = mount(ChatToast)

    wrapper.vm.show({
      username: 'chcaya',
      userAvatar: avatarUrl,
      userId: 'u00000',
      message: '你好',
      isShare: '0',
    })

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('chcaya')

    expect(wrapper.text()).toContain('你好')
  })

  it('多用户切换', async () => {
    const wrapper = mount(ChatToast)

    wrapper.vm.show({
      userId: 'u00000',
      username: 'chcaya',
      userAvatar: avatarUrl,
      message: '在干嘛',
      isShare: '0',
    })

    wrapper.vm.show({
      userId: 'u00001',
      username: 'zhangsan',
      userAvatar: avatarUrl,
      message: '出来玩',
      isShare: '0',
    })

    await wrapper.vm.$nextTick()

    const avatars = wrapper.findAll('li img')

    await avatars[1]?.trigger('click')

    expect(wrapper.text()).toContain('zhangsan')

    await avatars[0]?.trigger('click')

    expect(wrapper.text()).toContain('chcaya')
  })

  it('发送消息', async () => {
    const wrapper = mount(ChatToast)

    wrapper.vm.show({
      username: 'chcaya',
      userAvatar: avatarUrl,
      userId: 'u00001',
      message: '上号',
      isShare: '0',
    })

    await wrapper.vm.$nextTick()

    const textarea = wrapper.find('textarea')
    await textarea.setValue('等下')
    await wrapper.find('button').trigger('click')

    const { socket } = await import('@/utils')

    expect(socket.emit).toHaveBeenCalledWith('sendMessage', {
      from: 'u00000',
      to: 'u00001',
      message: '等下',
      isShare: '0',
    })
  })

  it('enter 发送消息', async () => {
    const wrapper = mount(ChatToast)

    wrapper.vm.show({
      userId: 'u00001',
      username: 'zhangsan',
      userAvatar: avatarUrl,
      message: '你好',
      isShare: '0',
    })

    await wrapper.vm.$nextTick()

    const textarea = wrapper.find('textarea')

    await textarea.setValue('你好')

    await textarea.trigger('keydown', {
      key: 'Enter',
      shiftKey: true,
    })

    const { socket } = await import('@/utils')
    expect(socket.emit).not.toHaveBeenCalled()

    await textarea.trigger('keydown', {
      key: 'Enter',
      shiftKey: false,
    })

    expect(socket.emit).toHaveBeenCalled()
  })

  it('关闭 toast', async () => {
    const wrapper = mount(ChatToast)

    wrapper.vm.show({
      userId: 'u00001',
      username: 'zhangsan',
      userAvatar: avatarUrl,
      message: '你好',
      isShare: '0',
    })

    await wrapper.vm.$nextTick()

    await wrapper.find('.ico').trigger('click')

    expect(wrapper.find('.chat').exists()).toBe(false)
  })

  it('跳转到 chat 页面', async () => {
    const wrapper = mount(ChatToast)

    wrapper.vm.show({
      userId: 'u00001',
      username: 'zhangsan',
      userAvatar: avatarUrl,
      message: '你好',
      isShare: '0',
    })

    await wrapper.vm.$nextTick()

    const icons = wrapper.findAll('.ico')

    await icons[1]!.trigger('click')

    const router = (await import('@/router')).default

    expect(router.push).toHaveBeenCalledWith('/chat')
  })
})
