/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
type EventNames = 'API:UN_AUTH' | 'API:INVALID'

class EventEmitter {
  private listeners: Record<EventNames, Set<Function>> = {
    'API:UN_AUTH': new Set(),
    'API:INVALID': new Set(),
  }

  on(eventName: EventNames, listener: Function) {
    this.listeners[eventName]?.add(listener)
  }

  emit(eventName: EventNames, ...args: any[]) {
    this.listeners[eventName]?.forEach((listener) => listener(...args))
  }
}

export default new EventEmitter()
