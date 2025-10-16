import { io } from 'socket.io-client'
import type { Socket } from 'socket.io-client'

export const socket: Socket = io(import.meta.env.VITE_SOCKET)
