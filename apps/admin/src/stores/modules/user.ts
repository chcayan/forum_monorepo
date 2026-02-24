import { filterRoutes } from '@/router/filterRoutes'
import type { AppRoute, Permission } from '@/router/router'
import { asyncRoutes, constantRoutes } from '@/router/router'
import { create } from 'zustand'

interface UserState {
  permissions: (keyof Permission)[]
  routes: AppRoute[]
  setPermissions: (permissions: (keyof Permission)[]) => void
}

export const useUserStore = create<UserState>((set) => ({
  permissions: [],
  routes: constantRoutes,
  setPermissions(permissions) {
    const filtered = filterRoutes(asyncRoutes, permissions)

    set({
      permissions,
      routes: [...constantRoutes, ...filtered],
    })
  },
}))
