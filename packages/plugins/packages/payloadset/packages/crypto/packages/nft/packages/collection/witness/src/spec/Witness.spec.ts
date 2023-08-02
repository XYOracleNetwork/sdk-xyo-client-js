// Mock Date.now
const now = new Date()
jest.useFakeTimers().setSystemTime(now)

import { describeIf } from '@xylabs/jest-helpers'
import {
  isNftCollectionInfoPayload,
  NftCollectionWitnessConfigSchema,
  NftCollectionWitnessQueryPayload,
  NftCollectionWitnessQuerySchema,
} from '@xyo-network/crypto-nft-collection-payload-plugin'
import { Payload } from '@xyo-network/payload-model'

import { CryptoNftCollectionWitness } from '../Witness'

const validateObservation = (observation: Payload[]) => {
  const nfts = observation.filter(isNftCollectionInfoPayload)
  expect(nfts.length).toBeGreaterThan(0)
}

describeIf(process.env.INFURA_PROJECT_ID)('CryptoNftCollectionWitness', () => {
  const address = '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D'
  const chainId = 1
  describe('observe', () => {
    describe('with no address or chainId in query', () => {
      it('uses values from config', async () => {
        const witness = await CryptoNftCollectionWitness.create({ config: { address, chainId, schema: NftCollectionWitnessConfigSchema } })
        const query: NftCollectionWitnessQueryPayload = { schema: NftCollectionWitnessQuerySchema }
        const observation = await witness.observe([query])
        validateObservation(observation)
      })
    })
    describe('with address and chainId in query', () => {
      it('uses values from query', async () => {
        const witness = await CryptoNftCollectionWitness.create({ config: { schema: NftCollectionWitnessConfigSchema } })
        const query: NftCollectionWitnessQueryPayload = { address, chainId, schema: NftCollectionWitnessQuerySchema }
        const observation = await witness.observe([query])
        validateObservation(observation)
      })
    })
  })
})
