import { useRoutes } from 'react-router-dom'
import { lazy, type JSX } from 'react'
import { filterRoutes } from './filterRoutes'
import { useUserStore } from '@/stores'

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

const AuditPost = lazy(() => import('@/pages/auditPost/AuditPost'))
const EditPost = lazy(() => import('@/pages/editPost/EditPost'))
const EditUser = lazy(() => import('@/pages/editUser/EditUser'))
const Login = lazy(() => import('@/pages/login/Login'))
const Overview = lazy(() => import('@/pages/overview/Overview'))
const NotFound = lazy(() => import('@/pages/notFound/NotFound'))
const Layout = lazy(() => import('@/pages/layout/Layout'))

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
