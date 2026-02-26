import { useRoutes } from 'react-router-dom'
import AuditPost from '@/pages/auditPost/AuditPost'
import EditPost from '@/pages/editPost/EditPost'
import EditUser from '@/pages/editUser/EditUser'
import Login from '@/pages/login/Login'
import NotFound from '@/pages/notFound/NotFound'
import type { JSX } from 'react'
import Layout from '@/pages/layout/Layout'
import { filterRoutes } from './filterRoutes'
import { useUserStore } from '@/stores'
import Overview from '@/pages/overview/Overview'

export type Path = {
  '/': symbol
  '*': symbol
  '/login': symbol
  'audit-post': symbol
  'edit-post': symbol
  'edit-user': symbol
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
  children?: AppRoute[]
}

const asyncRoutes: AppRoute[] = [
  {
    path: 'audit-post',
    element: <AuditPost />,
    permission: 'audit_post',
  },
  {
    path: 'edit-post',
    element: <EditPost />,
    permission: 'edit_post',
  },
  {
    path: 'edit-user',
    element: <EditUser />,
    permission: 'edit_user',
  },
]

export default function AppRouter() {
  const permissions = useUserStore((state) => state.permissions)

  const routes = [
    {
      path: '/',
      element: <Layout />,
      children: [
        {
          index: true,
          element: <Overview />,
        },
        {
          path: '*',
          element: <NotFound />,
        },
        ...filterRoutes(asyncRoutes, permissions),
      ],
    },
    { path: '/login', element: <Login /> },
  ]

  return useRoutes(routes)
}
