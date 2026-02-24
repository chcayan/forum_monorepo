import type { AppRoute, Permission } from './router'

export function filterRoutes(
  routes: AppRoute[],
  permissions: (keyof Permission)[]
) {
  return routes.filter((route) => {
    if (!route.permission) return true
    return permissions.includes(route.permission)
  })
}
