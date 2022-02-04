import Bowser from 'bowser'

// we do this to fix importing in node-esm
// eslint-disable-next-line import/no-named-as-default-member
const parse = Bowser.parse

export const getBowserJson = () => {
  return window.navigator.userAgent ? parse(window.navigator.userAgent) : undefined
}
