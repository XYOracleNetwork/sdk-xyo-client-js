import type { Address } from '@xylabs/hex'
import type { WalletInstance } from '@xyo-network/account'
import { HDWallet } from '@xyo-network/account'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'

import { addressesContainsAll } from '../addressesContainsAll.ts'

describe('BoundWitnessValidator', () => {
  const payload = { schema: 'network.xyo.test', value: Date.now() }
  const oneWallet: WalletInstance[] = []
  const twoWallets: WalletInstance[] = []
  beforeAll(async () => {
    oneWallet.push(await HDWallet.random())
    twoWallets.push(await HDWallet.random(), await HDWallet.random())
  })
  describe('returns true', () => {
    const cases: [string, () => WalletInstance[]][] = [
      ['for no wallet', () => []],
      ['for single wallet', () => oneWallet],
      ['for multiple wallets', () => twoWallets],
    ]
    describe.each(cases)('%s when all sign', (_, signers) => {
      let addresses: Address[]
      beforeAll(() => {
        addresses = signers().map(x => x.address)
      })
      it('addresses empty', async () => {
        const all = signers()
        const [bw] = await new BoundWitnessBuilder().signers(all).payload(payload).build()
        expect(addressesContainsAll(bw, [])).toBeTrue()
      })
      it('all addresses present in boundwitness addresses', async () => {
        const all = signers()
        const [bw] = await new BoundWitnessBuilder().signers(all).payload(payload).build()
        expect(addressesContainsAll(bw, addresses)).toBeTrue()
      })
      it('with extra signers and all addresses present in boundwitness addresses', async () => {
        const extra = [...signers(), await HDWallet.random()]
        const [bw] = await new BoundWitnessBuilder().signers(extra).payload(payload).build()
        expect(addressesContainsAll(bw, addresses)).toBeTrue()
      })
    })
  })
  describe('returns false', () => {
    const cases: [string, () => WalletInstance[]][] = [
      // ['for no wallet', () => []], // This case intentionally skipped because empty addresses will always return true
      ['for single wallet', () => oneWallet],
      ['for multiple wallets', () => twoWallets],
    ]
    describe.each(cases)('%s', (_, signers) => {
      let addresses: Address[]
      beforeAll(() => {
        addresses = signers().map(x => x.address)
      })
      it('with no signers', async () => {
        const [bw] = await new BoundWitnessBuilder().payload(payload).build()
        expect(addressesContainsAll(bw, addresses)).toBeFalse()
      })
      it('with all signers but one', async () => {
        const less = [...signers().slice(0, -1), await HDWallet.random()]
        const [bw] = await new BoundWitnessBuilder().signers(less).payload(payload).build()
        expect(addressesContainsAll(bw, addresses)).toBeFalse()
      })
      it('with all different signers', async () => {
        const none = [await HDWallet.random(), await HDWallet.random()]
        const [bw] = await new BoundWitnessBuilder().signers(none).payload(payload).build()
        expect(addressesContainsAll(bw, addresses)).toBeFalse()
      })
    })
  })
})
