import { HDWallet } from '../HDWallet'

describe('HDWallet', () => {
  const mnemonic = 'later puppy sound rebuild rebuild noise ozone amazing hope broccoli crystal grief'
  describe('constructor', () => {
    it('can be created from HDNode', () => {
      const sut = HDWallet.fromMnemonic(mnemonic)
      expect(sut).toBeDefined()
    })
  })
})
