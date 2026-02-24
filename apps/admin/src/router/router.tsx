import AuditPost from '@/pages/auditPost'
import EditPost from '@/pages/editPost'
import EditUser from '@/pages/editUser'
import Home from '@/pages/home'
import NotFound from '@/pages/notFound'
import type { JSX } from 'react'

export type Path = {
  '/': symbol
  '*': symbol
  '/audit-post': symbol
  '/edit-post': symbol
  '/edit-user': symbol
}

export type Permission = {
  audit_post: symbol
  edit_post: symbol
  edit_user: symbol
}

export interface AppRoute {
  path: keyof Path
  element: JSX.Element
  permission?: keyof Permission
}

export const asyncRoutes: AppRoute[] = [
  {
    path: '/audit-post',
    element: <AuditPost />,
    permission: 'audit_post',
  },
  {
    path: '/edit-post',
    element: <EditPost />,
    permission: 'edit_post',
  },
  {
    path: '/edit-user',
    element: <EditUser />,
    permission: 'edit_user',
  },
]

export const constantRoutes: AppRoute[] = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]
