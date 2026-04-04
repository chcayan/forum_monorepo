export const getImgUrl = (url: string) => {
  return import.meta.env.VITE_IS_ELECTRON === 'true'
    ? import.meta.env.VITE_IMAGE_URL + url
    : url
}
