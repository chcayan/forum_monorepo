import { getAdminInfoAPI } from '@/api'
import { filterRoutes } from '@/router/filterRoutes'
import type { AppRoute, Permission } from '@/router/router'
import { asyncRoutes, constantRoutes } from '@/router/router'
import type { UserInfo } from '@forum-monorepo/types'
import { create } from 'zustand'

interface UserState {
  permissions: (keyof Permission)[]
  routes: AppRoute[]
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
  routes: constantRoutes,
  token: localStorage.getItem('token') || '',
  userInfo: defaultUserInfo,

  setPermissions(permissions) {
    const filtered = filterRoutes(asyncRoutes, permissions)

    set({
      permissions,
      routes: [...constantRoutes, ...filtered],
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
