import '@xylabs/vitest-extended'

import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { HDWallet } from '@xyo-network/wallet'
import type { WalletInstance } from '@xyo-network/wallet-model'
import {
  beforeAll,
  describe, expect, it,
} from 'vitest'

import { addressesContains } from '../addressesContains.ts'

describe('addressesContains', () => {
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
    it('with a single wallet and the address is present', async () => {
      const bw = await buildBoundWitness(oneWallet)
      const address = oneWallet[0].address
      expect(addressesContains(bw, address)).toBeTrue()
    })

    it('with multiple wallets and the address is present', async () => {
      const bw = await buildBoundWitness(twoWallets)
      const address = twoWallets[0].address
      expect(addressesContains(bw, address)).toBeTrue()
    })

    it('with extra signers and the address is present', async () => {
      const extraSigners = [...twoWallets, await HDWallet.random()]
      const bw = await buildBoundWitness(extraSigners)
      const address = twoWallets[1].address
      expect(addressesContains(bw, address)).toBeTrue()
    })
  })

  describe('returns false', () => {
    it('with no signers', async () => {
      const [bw] = await new BoundWitnessBuilder().payload(payload).build()
      const address = oneWallet[0].address
      expect(addressesContains(bw, address)).toBeFalse()
    })

    it('with a single wallet but a different address is checked', async () => {
      const bw = await buildBoundWitness(oneWallet)
      const randomAddress = (await HDWallet.random()).address
      expect(addressesContains(bw, randomAddress)).toBeFalse()
    })

    it('with multiple wallets but a non-existing address is checked', async () => {
      const bw = await buildBoundWitness(twoWallets)
      const randomAddress = (await HDWallet.random()).address
      expect(addressesContains(bw, randomAddress)).toBeFalse()
    })
  })
})
