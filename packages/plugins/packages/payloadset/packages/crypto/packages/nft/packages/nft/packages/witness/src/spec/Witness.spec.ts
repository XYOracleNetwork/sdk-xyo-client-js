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

describeIf(process.env.INFURA_PROJECT_ID)('CryptoWalletNftWitness', () => {
  const address = '0xacdaEEb57ff6886fC8e203B9Dd4C2b241DF89b7a'
  const chainId = 1
  describe('observe', () => {
    describe('with no address or chainId in query', () => {
      it('uses values from config', async () => {
        const witness = await CryptoWalletNftWitness.create({ config: { address, chainId, schema: NftWitnessConfigSchema } })
        const query: NftWitnessQuery = { schema: NftWitnessQuerySchema }
        const observation = await witness.observe([query])
        await validateObservation(observation)
      })
    })
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
