/* eslint-disable @typescript-eslint/no-explicit-any */
import { errorTrack } from '@forum-monorepo/sdk'
import type { App } from 'vue'

export function initErrorMonitor(app: App<Element>) {
  window.onerror = (msg, url, line, col, error) => {
    errorTrack('js_error', {
      msg,
      url,
      line,
      col,
      stack: error?.stack,
    })
  }

  window.onunhandledrejection = (e) => {
    errorTrack('promise_error', {
      reason: e.reason,
    })
  }

  window.addEventListener(
    'error',
    (e) => {
      const target = e.target as any

      if (target?.src || target?.href) {
        errorTrack('resource_error', {
          usr: target?.src || target?.href,
          tag: target?.tagName,
        })
      }
    },
    true
  )

  app.config.errorHandler = (err: any, instance, info) => {
    errorTrack('vue_error', {
      message: err.message,
      stack: err.stack,
      info,
    })
  }
}
