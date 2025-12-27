import { socketUrl } from './request'
import io from '@hyoga/uni-socket.io'

export const socket = io(socketUrl, {
  transports: ['websocket'],
})
