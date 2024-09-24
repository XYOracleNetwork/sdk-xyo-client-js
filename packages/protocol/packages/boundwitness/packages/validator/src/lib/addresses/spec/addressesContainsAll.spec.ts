import type { Address } from '@xylabs/hex'
import type { WalletInstance } from '@xyo-network/account'
import { HDWallet } from '@xyo-network/account'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'

import { addressesContainsAll } from '../addressesContainsAll.ts'

describe('BoundWitnessValidator', () => {
  const payload = { schema: 'network.xyo.test', value: Date.now() }
  const oneWallet: WalletInstance[] = []
  const twoWallets: WalletInstance[] = []
  const cases: [string, () => WalletInstance[]][] = [
    ['with single signer', () => oneWallet],
    ['with multiple signers', () => twoWallets],
  ]
  beforeAll(async () => {
    oneWallet.push(await HDWallet.random())
    twoWallets.push(await HDWallet.random(), await HDWallet.random())
  })
  describe.each(cases)('%s', (_, signers) => {
    let addresses: Address[]
    beforeAll(() => {
      addresses = signers().map(x => x.address)
    })
    describe('returns true', () => {
      it('when addresses empty', async () => {
        const all = signers()
        const [bw] = await new BoundWitnessBuilder().signers(all).payload(payload).build()
        expect(addressesContainsAll(bw, [])).toBeTrue()
      })
      it('when all addresses present in boundwitness addresses', async () => {
        const all = signers()
        const [bw] = await new BoundWitnessBuilder().signers(all).payload(payload).build()
        expect(addressesContainsAll(bw, addresses)).toBeTrue()
      })
      it('when all addresses present in boundwitness addresses with extra addresses', async () => {
        const extra = [...signers(), await HDWallet.random()]
        const [bw] = await new BoundWitnessBuilder().signers(extra).payload(payload).build()
        expect(addressesContainsAll(bw, addresses)).toBeTrue()
      })
    })
    describe('returns false', () => {
      it('when no addresses in boundwitness addresses', async () => {
        const [bw] = await new BoundWitnessBuilder().payload(payload).build()
        expect(addressesContainsAll(bw, addresses)).toBeFalse()
      })
      it('when missing one address in boundwitness addresses', async () => {
        const less = [...signers().slice(0, -1), await HDWallet.random()]
        const [bw] = await new BoundWitnessBuilder().signers(less).payload(payload).build()
        expect(addressesContainsAll(bw, addresses)).toBeFalse()
      })
      it('when missing all addresses in boundwitness addresses', async () => {
        const none = [await HDWallet.random(), await HDWallet.random()]
        const [bw] = await new BoundWitnessBuilder().signers(none).payload(payload).build()
        expect(addressesContainsAll(bw, addresses)).toBeFalse()
      })
    })
  })
})
