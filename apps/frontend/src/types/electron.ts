export interface Notify {
  type: 'chat'
  title: string
  body: string
}

export interface IElectronAPI {
  notify: (msg: Notify) => void
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}
