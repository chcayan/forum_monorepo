import { baseUrl } from './request'

export const getImgUrl = (url: string) => {
  if (url && url.indexOf('http') == -1) {
    return baseUrl + url
  } else {
    return url
  }
}
