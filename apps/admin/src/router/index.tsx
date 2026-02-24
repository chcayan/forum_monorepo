import { useUserStore } from '@/stores/modules/user'
import { useRoutes } from 'react-router-dom'

export default function AppRouter() {
  const routes = useUserStore((state) => state.routes)

  return useRoutes(routes)
}
