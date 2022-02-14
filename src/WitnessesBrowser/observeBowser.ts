import Bowser from 'bowser'

// we do this to fix importing in node-esm
// eslint-disable-next-line import/no-named-as-default-member
const parse = Bowser.parse

export const observeBowser = () => {
  if (typeof window !== 'undefined') {
    return window.navigator.userAgent ? parse(window.navigator.userAgent) : undefined
  }
}
