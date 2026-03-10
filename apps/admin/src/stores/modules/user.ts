import { checkIsLoginProhibitAPI, getAdminInfoAPI } from '@/api'
import type { Permission } from '@/router'
import { create } from 'zustand'

interface UserInfo {
  userId: string
  username: string
  userAvatar: string
  userEmail: string
  permissions: (keyof Permission)[]
}

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
  permissions: [],
}

export const useUserStore = create<UserState>((set, get) => ({
  permissions: [],
  token: localStorage.getItem('token') || '',
  userInfo: defaultUserInfo,

  setPermissions(permissions) {
    set({
      permissions,
    })
  },

  setToken(_token) {
    set({
      token: _token,
    })
    localStorage.setItem('token', get().token)
  },

  removeToken() {
    localStorage.removeItem('token')
    set({
      userInfo: defaultUserInfo,
      token: '',
      permissions: [],
    })
  },

  async setUserInfo() {
    const token = get().token
    if (!token) return

    await checkIsLoginProhibitAPI()
    const res = await getAdminInfoAPI()
    const data: UserInfo = res.data.data
    set({
      userInfo: data,
      permissions: data.permissions,
    })
  },
}))
