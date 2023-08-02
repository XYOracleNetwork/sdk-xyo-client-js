// Mock Date.now
const now = new Date()
jest.useFakeTimers().setSystemTime(now)

import { describeIf } from '@xylabs/jest-helpers'
import { isNftInfoPayload, NftWitnessConfigSchema, NftWitnessQueryPayload, NftWitnessQuerySchema } from '@xyo-network/crypto-nft-payload-plugin'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { HttpProvider } from 'web3-providers-http'

import { getExternalProviderFromHttpProvider } from '../lib'
import { CryptoNftCollectionWitness } from '../Witness'

const validateObservation = async (observation: Payload[]) => {
  const nfts = observation.filter(isNftInfoPayload)
  expect(nfts.length).toBeGreaterThan(0)
  expect(observation.length).toEqual(nfts.length)
  for (const nft of nfts) {
    const wrapped = PayloadWrapper.wrap(nft)
    expect(await wrapped.getValid()).toBe(true)
  }
}

describeIf(process.env.INFURA_PROJECT_ID)('CryptoNftCollectionWitness', () => {
  const address = '0xacdaEEb57ff6886fC8e203B9Dd4C2b241DF89b7a'
  const chainId = 1
  const network = 'homestead'
  const apiKey = process.env.INFURA_PROJECT_ID
  const provider = getExternalProviderFromHttpProvider(new HttpProvider(`https://${network}.infura.io/v3/${apiKey}`))
  describe('observe', () => {
    describe('with no address or chainId in query', () => {
      it('uses values from config', async () => {
        const witness = await CryptoNftCollectionWitness.create({ config: { address, chainId, schema: NftWitnessConfigSchema }, provider })
        const query: NftWitnessQueryPayload = { schema: NftWitnessQuerySchema }
        const observation = await witness.observe([query])
        await validateObservation(observation)
      })
    })
    describe('with address and chainId in query', () => {
      it('uses values from query', async () => {
        const witness = await CryptoNftCollectionWitness.create({ config: { schema: NftWitnessConfigSchema }, provider })
        const query: NftWitnessQueryPayload = { address, chainId, schema: NftWitnessQuerySchema }
        const observation = await witness.observe([query])
        await validateObservation(observation)
      })
    })
  })
})
