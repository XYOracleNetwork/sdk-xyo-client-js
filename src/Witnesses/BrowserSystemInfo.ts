import { parse } from 'bowser'

export const getBowserJson = () => {
  return window.navigator.userAgent ? parse(window.navigator.userAgent) : undefined
}
