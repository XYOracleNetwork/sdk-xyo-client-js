// Mock Date.now
const now = new Date()
jest.useFakeTimers().setSystemTime(now)

import { describeIf } from '@xylabs/jest-helpers'
import { isNftInfo, NftWitnessConfigSchema, NftWitnessQuery, NftWitnessQuerySchema } from '@xyo-network/crypto-nft-payload-plugin'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { CryptoWalletNftWitness } from '../Witness'

const validateObservation = async (observation: Payload[]) => {
  const nfts = observation.filter(isNftInfo)
  expect(nfts.length).toBeGreaterThan(0)
  expect(observation.length).toEqual(nfts.length)
  for (const nft of nfts) {
    const wrapped = PayloadWrapper.wrap(nft)
    expect(await wrapped.getValid()).toBe(true)
  }
}

describeIf(process.env.INFURA_PROJECT_ID)('CryptoWalletNftWitness -  Eth', () => {
  const address = '0xE0036fb4B5A3B232aCfC01fEc3bD1D787a93da75'
  const chainId = 1
  describe('observe', () => {
    describe('with address and chainId in query', () => {
      it('uses values from query', async () => {
        const witness = await CryptoWalletNftWitness.create({ config: { schema: NftWitnessConfigSchema } })
        const query: NftWitnessQuery = { address, chainId, schema: NftWitnessQuerySchema }
        const observation = await witness.observe([query])
        await validateObservation(observation)
      })
    })
  })
})

describeIf(process.env.INFURA_PROJECT_ID)('CryptoWalletNftWitness - Arb', () => {
  const address = '0x05BD8eE915a58eA9bD5d1D64a15BC1E462d555Bf'
  const chainId = 42161
  describe('observe', () => {
    describe('with address and chainId in query', () => {
      it('uses values from query', async () => {
        const witness = await CryptoWalletNftWitness.create({ config: { schema: NftWitnessConfigSchema } })
        const query: NftWitnessQuery = { address, chainId, schema: NftWitnessQuerySchema }
        const observation = await witness.observe([query])
        await validateObservation(observation)
      })
    })
  })
})
