import { useRoutes } from 'react-router-dom'
import { lazy, type JSX } from 'react'
import { filterRoutes } from './filterRoutes'
import { useUserStore } from '@/stores'

export type Path = {
  '/': symbol
  '*': symbol
  '/login': symbol
  'post-review': symbol
  'post-report-review': symbol
  'comment-report-review': symbol
  'user-perm-modify': symbol
}

export type Permission = {
  post_review: symbol
  report_review: symbol
  user_perm_modify: symbol
}

export interface AppRoute {
  path: keyof Path
  element: JSX.Element
  permission?: keyof Permission
  children?: AppRoute[]
}

const PostReview = lazy(() => import('@/pages/PostReview/PostReview'))
const PostReportReview = lazy(
  () => import('@/pages/postReportReview/PostReportReview')
)
const CommentReportReview = lazy(
  () => import('@/pages/commentReportReview/CommentReportReview')
)
const UserPermModify = lazy(
  () => import('@/pages/userPermModify/UserPermModify')
)
const Login = lazy(() => import('@/pages/login/Login'))
const Overview = lazy(() => import('@/pages/overview/Overview'))
const NotFound = lazy(() => import('@/pages/notFound/NotFound'))
const Layout = lazy(() => import('@/pages/layout/Layout'))

const asyncRoutes: AppRoute[] = [
  {
    path: 'post-review',
    element: <PostReview />,
    permission: 'post_review',
  },
  {
    path: 'post-report-review',
    element: <PostReportReview />,
    permission: 'report_review',
  },
  {
    path: 'comment-report-review',
    element: <CommentReportReview />,
    permission: 'report_review',
  },
  {
    path: 'user-perm-modify',
    element: <UserPermModify />,
    permission: 'user_perm_modify',
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
