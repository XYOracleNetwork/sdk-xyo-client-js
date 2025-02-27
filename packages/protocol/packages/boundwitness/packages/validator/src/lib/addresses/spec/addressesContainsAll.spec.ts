import '@xylabs/vitest-extended'

import type { Address } from '@xylabs/hex'
import type { WalletInstance } from '@xyo-network/account'
import { HDWallet } from '@xyo-network/account'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import {
  beforeAll,
  describe, expect, it,
} from 'vitest'

import { addressesContainsAll } from '../addressesContainsAll.ts'

describe('addressesContainsAll', () => {
  const payload = { schema: 'network.xyo.test', value: Date.now() }
  let oneWallet: WalletInstance[] = []
  let twoWallets: WalletInstance[] = []

  beforeAll(async () => {
    oneWallet = [await HDWallet.random()]
    twoWallets = [await HDWallet.random(), await HDWallet.random()]
  })

  const buildBoundWitness = async (signers: WalletInstance[]) => {
    const [bw] = await new BoundWitnessBuilder().signers(signers).payload(payload).build()
    return bw
  }

  describe('returns true', () => {
    const cases: [string, () => WalletInstance[]][] = [
      ['with no wallets', () => []],
      ['with single wallet', () => oneWallet],
      ['with multiple wallets', () => twoWallets],
    ]
    it('with no signers and empty addresses supplied', async () => {
      const bw = await buildBoundWitness([])
      expect(addressesContainsAll(bw, [])).toBeTrue()
    })
    describe.each(cases)('%s', (_, wallets) => {
      let addresses: Address[]
      beforeAll(() => {
        addresses = wallets().map(x => x.address)
      })
      it('with  all wallets as signers and empty addresses supplied', async () => {
        const bw = await buildBoundWitness(wallets())
        expect(addressesContainsAll(bw, [])).toBeTrue()
      })
      it('with all wallets as signers and all wallet addresses supplied', async () => {
        const bw = await buildBoundWitness(wallets())
        expect(addressesContainsAll(bw, addresses)).toBeTrue()
      })
      it('with all wallets (and extra wallets) as signers and all wallet addresses supplied', async () => {
        const extraSigners = [...wallets(), await HDWallet.random()]
        const bw = await buildBoundWitness(extraSigners)
        expect(addressesContainsAll(bw, addresses)).toBeTrue()
      })
    })
  })
  describe('returns false', () => {
    const cases: [string, () => WalletInstance[]][] = [
      ['with single wallet', () => oneWallet],
      ['with multiple wallets', () => twoWallets],
    ]
    describe.each(cases)('%s', (_, wallets) => {
      let addresses: Address[]
      beforeAll(() => {
        addresses = wallets().map(x => x.address)
      })
      it('with no signers and all wallet addresses supplied', async () => {
        const [bw] = await new BoundWitnessBuilder().payload(payload).build()
        expect(addressesContainsAll(bw, addresses)).toBeFalse()
      })
      it('with all signers except one and all wallet addresses supplied', async () => {
        const lessSigners = [...wallets().slice(0, -1), await HDWallet.random()]
        const bw = await buildBoundWitness(lessSigners)
        expect(addressesContainsAll(bw, addresses)).toBeFalse()
      })
      it('with all different signers and all wallet addresses supplied', async () => {
        const differentSigners = [await HDWallet.random(), await HDWallet.random()]
        const bw = await buildBoundWitness(differentSigners)
        expect(addressesContainsAll(bw, addresses)).toBeFalse()
      })
    })
  })
})
