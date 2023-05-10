/**
 * @jest-environment jsdom
 */

import { HDWallet } from '../HDWallet'

describe('HDWallet', () => {
  const mnemonic = 'later puppy sound rebuild rebuild noise ozone amazing hope broccoli crystal grief'
  describe('constructor', () => {
    it('can be created from mnemonic', () => {
      const sut = HDWallet.fromMnemonic(mnemonic)
      expect(sut).toBeDefined()
    })
  })
  describe('derivePath', () => {
    const paths = ['m/0/4', "m/44'/0'/0'", "m/44'/60'/0'/0/0", "m/44'/60'/0'/0/1", "m/49'/0'/0'", "m/84'/0'/0'", "m/84'/0'/0'/0"]
    it.each(paths)('works repeatably & interoperably', (path: string) => {
      const sutA = HDWallet.fromMnemonic(mnemonic)
      const sutB = HDWallet.fromExtendedKey(sutA.extendedKey)
      const accountA = sutA.derivePath(path)
      const accountB = sutB.derivePath(path)
      expect(accountA.addressValue.hex).toBe(accountB.addressValue.hex)
      expect(accountA.private.hex).toBe(accountB.private.hex)
      expect(accountA.public.hex).toBe(accountB.public.hex)
    })
    it('works when paths provided incrementally', () => {
      const base = 'm'
      const parent = "44'/60'/0'"
      const child = '0/1'
      const sutA = HDWallet.fromMnemonic(mnemonic)
      const sutB = HDWallet.fromMnemonic(mnemonic)
      const accountA = sutA.derivePath(base).derivePath(parent).derivePath(child)
      const accountB = sutB.derivePath([base, parent, child].join('/'))
      expect(accountA.addressValue.hex).toBe(accountB.addressValue.hex)
      expect(accountA.private.hex).toBe(accountB.private.hex)
      expect(accountA.public.hex).toBe(accountB.public.hex)
    })
  })
})
