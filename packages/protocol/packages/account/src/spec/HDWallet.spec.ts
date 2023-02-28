import { HDWallet } from '../HDWallet'

describe('HDWallet', () => {
  const mnemonic = 'later puppy sound rebuild rebuild noise ozone amazing hope broccoli crystal grief'
  describe('constructor', () => {
    it('can be created from mnemonic', () => {
      const sut = HDWallet.fromMnemonic(mnemonic)
      expect(sut).toBeDefined()
    })
  })
  describe('deriveAccount', () => {
    it('works repeatably', () => {
      const sutA = HDWallet.fromMnemonic(mnemonic)
      const sutB = HDWallet.fromMnemonic(mnemonic)
      const path = "m/44'/60'/0'/0/0"
      const accountA = sutA.deriveAccount(path)
      const accountB = sutB.deriveAccount(path)
      expect(accountA.addressValue.hex).toBe(accountB.addressValue.hex)
      expect(accountA.private.hex).toBe(accountB.private.hex)
      expect(accountA.public.hex).toBe(accountB.public.hex)
    })
  })
})
