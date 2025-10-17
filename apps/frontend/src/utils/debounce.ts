/* eslint-disable @typescript-eslint/no-explicit-any */
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay = 300
) {
  let timer: number | undefined

  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timer)
    timer = window.setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}
