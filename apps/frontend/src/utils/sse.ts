export function createEs(userId: string) {
  return new EventSource(`${import.meta.env.VITE_SSE_URL}/sse/${userId}`)
}
