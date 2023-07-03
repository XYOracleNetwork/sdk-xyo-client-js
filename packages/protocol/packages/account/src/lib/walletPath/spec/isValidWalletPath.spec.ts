import { isValidAbsoluteWalletPath, isValidRelativeWalletPath } from '../isValidWalletPath'

describe('isValidRelativeWalletPath', () => {
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
})
describe('isValidRelativeWalletPath', () => {
  const validPaths = ['0/4', "44'/0'/0'", "44'/60'/0'/0/0", "44'/60'/0'/0/1", "49'/0'/0'", "84'/0'/0'", "84'/0'/0'/0"]
  const invalidPaths = [
    // Empty
    '',
    '/',
    '//',
    // Absolute
    'm/0/4',
    // Trialing slashes
    '0/',
    '0/1/',
  ]
  describe('with valid path', () => {
    it.each(validPaths)('returns true', (path) => {
      expect(isValidRelativeWalletPath(path)).toBe(true)
    })
  })
  describe('with invalid path', () => {
    it.each(invalidPaths)('returns false', (path) => {
      expect(isValidRelativeWalletPath(path)).toBe(false)
    })
  })
})
