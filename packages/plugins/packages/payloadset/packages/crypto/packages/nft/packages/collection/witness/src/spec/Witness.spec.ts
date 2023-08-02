// Mock Date.now
const now = new Date()
jest.useFakeTimers().setSystemTime(now)
import { describeIf } from '@xylabs/jest-helpers'
import { HDWallet } from '@xyo-network/account'
import { AccountInstance } from '@xyo-network/account-model'
import {
  isNftCollectionInfoPayload,
  NftCollectionWitnessConfigSchema,
  NftCollectionWitnessQueryPayload,
  NftCollectionWitnessQuerySchema,
} from '@xyo-network/crypto-nft-collection-payload-plugin'
import { Payload } from '@xyo-network/payload-model'

import { CryptoNftCollectionWitness } from '../Witness'

const validateObservation = (observation: Payload[]) => {
  const results = observation.filter(isNftCollectionInfoPayload)
  expect(results.length).toBeGreaterThan(0)
  const collectionInfo = results[0]
  expect(collectionInfo.address).toBeString()
  expect(collectionInfo.chainId).toBeNumber()
  expect(collectionInfo.name).toBeString()
  expect(collectionInfo.tokenType).toBeString()
  expect(collectionInfo.sources).toBeArray()
  expect(collectionInfo.sources?.length).toBeGreaterThan(0)
}

describeIf(process.env.INFURA_PROJECT_ID)('CryptoNftCollectionWitness', () => {
  const address = '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D'
  const chainId = 1
  let account: AccountInstance
  describe('observe', () => {
    beforeAll(async () => {
      account = await HDWallet.random()
    })
    describe('with no address or chainId in query', () => {
      it('uses values from config', async () => {
        const witness = await CryptoNftCollectionWitness.create({ account, config: { address, chainId, schema: NftCollectionWitnessConfigSchema } })
        const query: NftCollectionWitnessQueryPayload = { schema: NftCollectionWitnessQuerySchema }
        const observation = await witness.observe([query])
        validateObservation(observation)
      })
    })
    describe('with address and chainId in query', () => {
      it('uses values from query', async () => {
        const witness = await CryptoNftCollectionWitness.create({ account, config: { schema: NftCollectionWitnessConfigSchema } })
        const query: NftCollectionWitnessQueryPayload = { address, chainId, schema: NftCollectionWitnessQuerySchema }
        const observation = await witness.observe([query])
        validateObservation(observation)
      })
    })
  })
})
