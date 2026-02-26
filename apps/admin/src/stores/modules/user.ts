import { getAdminInfoAPI } from '@/api'
import type { Permission } from '@/router'
import type { UserInfo } from '@forum-monorepo/types'
import { create } from 'zustand'

interface UserState {
  permissions: (keyof Permission)[]
  token: string
  userInfo: UserInfo

  setPermissions: (permissions: (keyof Permission)[]) => void
  setToken: (token: string) => void
  removeToken: () => void
  setUserInfo: () => void
}

const defaultUserInfo = {
  userId: '',
  username: '',
  userAvatar: '',
  userEmail: '',
  registration: '',
  follows: '',
  fans: '',
  backgroundImg: '',
  sex: '',
  signature: '',
}

export const useUserStore = create<UserState>((set, get) => ({
  permissions: JSON.parse(localStorage.getItem('perm') || '[]') || [],
  token: localStorage.getItem('token') || '',
  userInfo: defaultUserInfo,

  setPermissions(permissions) {
    set({
      permissions,
    })
    localStorage.setItem('perm', JSON.stringify(get().permissions))
  },

  setToken(_token) {
    set({
      token: _token,
    })
    localStorage.setItem('token', get().token)
  },

  removeToken() {
    localStorage.removeItem('token')
    localStorage.removeItem('perm')
    set({
      userInfo: defaultUserInfo,
      token: '',
      permissions: [],
    })
  },

  async setUserInfo() {
    const res = await getAdminInfoAPI('self')
    set({
      userInfo: res.data.data,
    })
  },
}))
