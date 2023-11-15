import { describeIf } from '@xylabs/jest-helpers'
import { isNftInfo, NftWitnessConfigSchema, NftWitnessQuery, NftWitnessQuerySchema } from '@xyo-network/crypto-nft-payload-plugin'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { getProvidersFromEnv } from '@xyo-network/witness-blockchain'

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

/**
 * @group slow
 */

describeIf(process.env.INFURA_PROJECT_ID)('CryptoWalletNftWitness', () => {
  //const address = '0xacdaEEb57ff6886fC8e203B9Dd4C2b241DF89b7a'
  const address = '0xD3EaBb661771911f87c50cf105BDA74468C75b01'
  describe('observe', () => {
    describe('with no address or chainId in config', () => {
      it('uses values from config', async () => {
        const witness = await CryptoWalletNftWitness.create({
          account: 'random',
          config: { address, schema: NftWitnessConfigSchema },
          providers: getProvidersFromEnv,
        })
        const query: NftWitnessQuery = { schema: NftWitnessQuerySchema }
        const observation = await witness.observe([query])
        await validateObservation(observation)
      })
    })
    describe('with address and chainId in query', () => {
      it('uses values from query', async () => {
        const witness = await CryptoWalletNftWitness.create({
          account: 'random',
          config: { schema: NftWitnessConfigSchema },
          providers: getProvidersFromEnv,
        })
        const query: NftWitnessQuery = { address, schema: NftWitnessQuerySchema }
        const observation = await witness.observe([query])
        await validateObservation(observation)
      })
    })
  })
})
