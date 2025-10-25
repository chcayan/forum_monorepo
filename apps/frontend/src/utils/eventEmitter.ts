/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
type ApiEvent = 'API:UN_AUTH' | 'API:INVALID' | 'API:BAD_REQUEST'
type TabEvent = 'TAB:LOGIN' | 'TAB:CLOSE_AVATAR_WIDGET'
type EventNames = ApiEvent | TabEvent

class EventEmitter {
  private listeners: Record<EventNames, Set<Function>> = {
    'API:UN_AUTH': new Set(),
    'API:INVALID': new Set(),
    'API:BAD_REQUEST': new Set(),
    'TAB:LOGIN': new Set(),
    'TAB:CLOSE_AVATAR_WIDGET': new Set(),
  }

  on(eventName: EventNames, listener: Function) {
    this.listeners[eventName]?.add(listener)
  }

  emit(eventName: EventNames, ...args: any[]) {
    this.listeners[eventName]?.forEach((listener) => listener(...args))
  }
}

export default new EventEmitter()
