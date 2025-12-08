/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
type ApiEvent = 'API:UN_AUTH' | 'API:INVALID' | 'API:BAD_REQUEST'
type TabEvent = 'TAB:LOGIN' | 'TAB:CLOSE_AVATAR_WIDGET'
type BaseEvent =
  | 'EVENT:UPDATE_COMMENT_LIST'
  | 'EVENT:UPDATE_POST_LIST'
  | 'EVENT:UPDATE_USER_POST_LIST'
  | 'EVENT:UPDATE_POST_DETAIL'
  | 'EVENT:UPDATE_POST_COLLECT_STATUS'
  | 'EVENT:TOGGLE_FLAG'
  | 'EVENT:PUBLISH_POST'
  | 'EVENT:RESET_POST_IMAGES'
  | 'EVENT:GET_MORE_POST'
  | 'EVENT:GET_USER_COLLECT_POST_ID_LIST'
  | 'EVENT:REACTIVE_USER_VIEW'
  | 'EVENT:DELETE_USER_POST_LIST'
  | 'EVENT:UPDATE_CHAT_RECORDS'
type EventNames = ApiEvent | TabEvent | BaseEvent

class EventEmitter {
  private listeners: Record<EventNames, Set<Function>> = {
    'API:UN_AUTH': new Set(),
    'API:INVALID': new Set(),
    'API:BAD_REQUEST': new Set(),
    'TAB:LOGIN': new Set(),
    'TAB:CLOSE_AVATAR_WIDGET': new Set(),
    'EVENT:FOCUS_COMMENT_INPUT': new Set(),
    'EVENT:UPDATE_COMMENT_LIST': new Set(),
    'EVENT:UPDATE_POST_LIST': new Set(),
    'EVENT:UPDATE_POST_DETAIL': new Set(),
    'EVENT:UPDATE_POST_COLLECT_STATUS': new Set(),
    'EVENT:TOGGLE_FLAG': new Set(),
    'EVENT:PUBLISH_POST': new Set(),
    'EVENT:RESET_POST_IMAGES': new Set(),
    'EVENT:GET_MORE_POST': new Set(),
    'EVENT:GET_USER_COLLECT_POST_ID_LIST': new Set(),
    'EVENT:UPDATE_USER_POST_LIST': new Set(),
    'EVENT:REACTIVE_USER_VIEW': new Set(),
    'EVENT:DELETE_USER_POST_LIST': new Set(),
    'EVENT:UPDATE_CHAT_RECORDS': new Set(),
  }

  on(eventName: EventNames, listener: Function) {
    this.listeners[eventName]?.add(listener)

    return () => this.off(eventName, listener)
  }

  emit(eventName: EventNames, ...args: any[]) {
    this.listeners[eventName]?.forEach((listener) => listener(...args))
  }

  emitAsync(eventName: EventNames, ...args: any[]) {
    const promises: Promise<any>[] = []

    this.listeners[eventName]?.forEach((listener) => {
      const result = listener(...args)
      promises.push(Promise.resolve(result))
    })

    return Promise.all(promises)
  }

  off(eventName: EventNames, listener: Function) {
    this.listeners[eventName]?.delete(listener)
  }

  clear(eventName?: EventNames) {
    if (eventName) this.listeners[eventName]?.clear()
    else Object.values(this.listeners).forEach((set) => set.clear())
  }
}

export default new EventEmitter()
