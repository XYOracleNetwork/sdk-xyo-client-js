import '@xylabs/vitest-extended'

import type { Address } from '@xylabs/hex'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { HDWallet } from '@xyo-network/wallet'
import type { WalletInstance } from '@xyo-network/wallet-model'
import {
  beforeAll,
  describe, expect, it,
} from 'vitest'

import { boundWitnessArrayPropertyContainsAny } from '../boundWitnessArrayPropertyContainsAny.ts'

describe('boundWitnessArrayPropertyContainsAny', () => {
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
      expect(boundWitnessArrayPropertyContainsAny(bw, 'addresses', [])).toBeTrue() // No signers and no addresses should return true
    })
    describe.each(cases)('%s', (_, wallets) => {
      let addresses: Address[]
      beforeAll(() => {
        addresses = wallets().map(x => x.address)
      })
      it('with all wallets as signers and all wallet addresses supplied', async () => {
        const bw = await buildBoundWitness(wallets())
        expect(boundWitnessArrayPropertyContainsAny(bw, 'addresses', addresses)).toBeTrue() // Should be true if wallets exist
      })
      it('with all wallets (and extra wallets) as signers and all wallet addresses supplied', async () => {
        const extraSigners = [...wallets(), await HDWallet.random()]
        const bw = await buildBoundWitness(extraSigners)
        expect(boundWitnessArrayPropertyContainsAny(bw, 'addresses', addresses)).toBeTrue() // Should still be true with extras
      })
      it('with only one matching signer', async () => {
        const extraSigners = [await HDWallet.random(), ...wallets()]
        const bw = await buildBoundWitness(extraSigners)
        expect(boundWitnessArrayPropertyContainsAny(bw, 'addresses', addresses)).toBeTrue() // Should return true with one match
      })
    })
  })
  describe('returns false', () => {
    const cases: [string, () => WalletInstance[]][] = [
      // ['with no wallets', () => []],
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
        expect(boundWitnessArrayPropertyContainsAny(bw, 'addresses', addresses)).toBeFalse() // No signers, no match
      })
      it('with signers that do not include any of the wallet addresses supplied', async () => {
        const differentSigners = [await HDWallet.random(), await HDWallet.random()]
        const bw = await buildBoundWitness(differentSigners)
        expect(boundWitnessArrayPropertyContainsAny(bw, 'addresses', addresses)).toBeFalse() // None of the wallet addresses are in the bound witness
      })
      it('with extra signers and no wallet addresses supplied', async () => {
        const extraSigners = [await HDWallet.random(), await HDWallet.random()]
        const bw = await buildBoundWitness(extraSigners)
        expect(boundWitnessArrayPropertyContainsAny(bw, 'addresses', addresses)).toBeFalse() // None of the supplied addresses match
      })
    })
  })
})
