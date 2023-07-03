import { isValidAbsoluteWalletPath } from '../isValidAbsoluteWalletPath'

const validPaths = ['m', 'm/0/4', "m/44'/0'/0'", "m/44'/60'/0'/0/0", "m/44'/60'/0'/0/1", "m/49'/0'/0'", "m/84'/0'/0'", "m/84'/0'/0'/0"]
const invalidPaths = [
  // Empty
  '',
  '//',
  'm/0//4',
  // Relative
  '/0/4',
  // Trialing slashes
  'm/',
  'm/0/',
]

describe('isValidAbsoluteWalletPath', () => {
  describe('with valid path', () => {
    it.each(validPaths)('returns true', (path) => {
      expect(isValidAbsoluteWalletPath(path)).toBe(true)
    })
  })
  describe('with invalid path', () => {
    it.each(invalidPaths)('returns false', (path) => {
      expect(isValidAbsoluteWalletPath(path)).toBe(false)
    })
  })
})
