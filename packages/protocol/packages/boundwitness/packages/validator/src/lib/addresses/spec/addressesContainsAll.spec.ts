import type { WalletInstance } from '@xyo-network/account'
import { HDWallet } from '@xyo-network/account'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'

import { addressesContainsAll } from '../addressesContainsAll.ts'

describe('BoundWitnessValidator', () => {
  const payload = { schema: 'network.xyo.test', value: Date.now() }
  const cases: [string, WalletInstance[]][] = [
    ['with no signer', [] as WalletInstance[]],
    ['with single signer', [] as WalletInstance[]],
    ['with multiple signers', [] as WalletInstance[]],
  ]
  beforeAll(async () => {
    cases[1][1] = [await HDWallet.random()]
    cases[2][1] = [await HDWallet.random(), await HDWallet.random()]
  })
  describe.each(cases)('%s', (_, signers) => {
    describe('returns true', () => {
      it('when all addresses present', async () => {
        const [bw] = await new BoundWitnessBuilder().signers(signers).payload(payload).build()
        expect(addressesContainsAll(bw, signers)).toBeTrue()
      })
      it('when extra addresses present', async () => {
        const extra = [...signers, await HDWallet.random()]
        const [bw] = await new BoundWitnessBuilder().signers(extra).payload(payload).build()
        expect(addressesContainsAll(bw, signers)).toBeTrue()
      })
    })
    describe('returns false', () => {
      it('when single address missing', async () => {
      //
      })
      it('when all addresses missing', async () => {
      //
      })
    })
  })
})
