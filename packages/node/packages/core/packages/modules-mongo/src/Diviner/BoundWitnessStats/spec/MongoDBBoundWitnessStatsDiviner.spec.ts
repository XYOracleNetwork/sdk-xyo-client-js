import { Account } from '@xyo-network/account'
import { AddressSpaceDiviner } from '@xyo-network/diviner'
import {
  BoundWitnessStatsQueryPayload,
  BoundWitnessStatsQuerySchema,
  BoundWitnessStatsSchema,
  XyoBoundWitnessWithMeta,
} from '@xyo-network/node-core-model'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { mock, MockProxy } from 'jest-mock-extended'

import { COLLECTIONS } from '../../../collections'
import { MongoDBBoundWitnessStatsDiviner, MongoDBBoundWitnessStatsDivinerConfigSchema } from '../MongoDBBoundWitnessStatsDiviner'

describe('MongoDBBoundWitnessStatsDiviner', () => {
  const phrase = 'temp'
  const address = new Account({ phrase }).addressValue.hex
  const addressSpaceDiviner: MockProxy<AddressSpaceDiviner> = mock<AddressSpaceDiviner>()
  const logger = mock<Console>()
  const boundWitnessSdk = new BaseMongoSdk<XyoBoundWitnessWithMeta>({
    collection: COLLECTIONS.BoundWitnesses,
    dbConnectionString: process.env.MONGO_CONNECTION_STRING,
  })
  let sut: MongoDBBoundWitnessStatsDiviner
  beforeAll(async () => {
    sut = (await MongoDBBoundWitnessStatsDiviner.create({
      addressSpaceDiviner,
      boundWitnessSdk,
      config: { schema: MongoDBBoundWitnessStatsDivinerConfigSchema },
      logger,
    })) as MongoDBBoundWitnessStatsDiviner
  })
  describe('divine', () => {
    describe('with address supplied in query', () => {
      it('divines results for the address', async () => {
        const query: BoundWitnessStatsQueryPayload = { address, schema: BoundWitnessStatsQuerySchema }
        const result = await sut.divine([query])
        expect(result).toBeArrayOfSize(1)
        const actual = result[0]
        expect(actual).toBeObject()
        expect(actual.schema).toBe(BoundWitnessStatsSchema)
        expect(actual.count).toBeNumber()
      })
    })
    describe('with no address supplied in query', () => {
      it('divines results for all addresses', async () => {
        const query: BoundWitnessStatsQueryPayload = { schema: BoundWitnessStatsQuerySchema }
        const result = await sut.divine([query])
        expect(result).toBeArrayOfSize(1)
        const actual = result[0]
        expect(actual).toBeObject()
        expect(actual.schema).toBe(BoundWitnessStatsSchema)
        expect(actual.count).toBeNumber()
      })
    })
  })
})
