/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
type ApiEvent =
  | 'API:UN_AUTH'
  | 'API:INVALID'
  | 'API:BAD_REQUEST'
  | 'API:FORBIDDEN'

type BaseEvent =
  | 'EVENT:UPDATE_POST_REVIEW'
  | 'EVENT:UPDATE_POST_REPORT'
  | 'EVENT:UPDATE_COMMENT_REPORT'
  | 'EVENT:UPDATE_USER_PERMS'
  | 'EVENT:RECOVER_POST_REVIEW_PERM'
  | 'EVENT:RECOVER_REPORT_REVIEW_PERM'
  | 'EVENT:RECOVER_USER_PERM_MODIFY_PERM'
  | 'EVENT:SAVE_POST_REVIEW_PERM'
  | 'EVENT:SAVE_REPORT_REVIEW_PERM'
  | 'EVENT:SAVE_USER_PERM_MODIFY_PERM'
type EventNames = ApiEvent | BaseEvent

class EventEmitter {
  private listeners: Record<EventNames, Set<Function>> = {
    'API:UN_AUTH': new Set(),
    'API:INVALID': new Set(),
    'API:BAD_REQUEST': new Set(),
    'API:FORBIDDEN': new Set(),
    'EVENT:UPDATE_POST_REVIEW': new Set(),
    'EVENT:UPDATE_POST_REPORT': new Set(),
    'EVENT:UPDATE_COMMENT_REPORT': new Set(),
    'EVENT:UPDATE_USER_PERMS': new Set(),
    'EVENT:RECOVER_POST_REVIEW_PERM': new Set(),
    'EVENT:RECOVER_REPORT_REVIEW_PERM': new Set(),
    'EVENT:RECOVER_USER_PERM_MODIFY_PERM': new Set(),
    'EVENT:SAVE_POST_REVIEW_PERM': new Set(),
    'EVENT:SAVE_REPORT_REVIEW_PERM': new Set(),
    'EVENT:SAVE_USER_PERM_MODIFY_PERM': new Set(),
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
