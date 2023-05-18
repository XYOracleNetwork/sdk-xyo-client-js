import { describeIf } from '@xylabs/jest-helpers'
import { Account } from '@xyo-network/account'
import {
  PayloadStatsDivinerConfigSchema,
  PayloadStatsDivinerSchema,
  PayloadStatsQueryPayload,
  PayloadStatsQuerySchema,
} from '@xyo-network/diviner-payload-stats-model'
import { BoundWitnessWithMeta, JobQueue, PayloadWithMeta } from '@xyo-network/node-core-model'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { mock, MockProxy } from 'jest-mock-extended'

import { canAddMongoModules } from '../../../canAddMongoModules'
import { COLLECTIONS } from '../../../collections'
import { MongoDBPayloadStatsDiviner } from '../MongoDBPayloadStatsDiviner'

describeIf(canAddMongoModules())('MongoDBPayloadStatsDiviner', () => {
  const phrase = 'temp'
  const address = new Account({ phrase }).addressValue.hex
  const logger = mock<Console>()
  const boundWitnessSdk = new BaseMongoSdk<BoundWitnessWithMeta>({
    collection: COLLECTIONS.BoundWitnesses,
    dbConnectionString: process.env.MONGO_CONNECTION_STRING,
  })
  const payloadSdk = new BaseMongoSdk<PayloadWithMeta>({
    collection: COLLECTIONS.Payloads,
    dbConnectionString: process.env.MONGO_CONNECTION_STRING,
  })
  const jobQueue: MockProxy<JobQueue> = mock<JobQueue>()
  let sut: MongoDBPayloadStatsDiviner
  beforeAll(async () => {
    sut = await MongoDBPayloadStatsDiviner.create({
      boundWitnessSdk,
      config: { schema: PayloadStatsDivinerConfigSchema },
      jobQueue,
      logger,
      payloadSdk,
    })
  })
  describe('divine', () => {
    describe('with address supplied in query', () => {
      it('divines results for the address', async () => {
        const query: PayloadStatsQueryPayload = { address, schema: PayloadStatsQuerySchema }
        const result = await sut.divine([query])
        expect(result).toBeArrayOfSize(1)
        const actual = result[0]
        expect(actual).toBeObject()
        expect(actual.schema).toBe(PayloadStatsDivinerSchema)
        expect(actual.count).toBeNumber()
      })
    })
    describe('with no address supplied in query', () => {
      it('divines results for all addresses', async () => {
        const query: PayloadStatsQueryPayload = { schema: PayloadStatsQuerySchema }
        const result = await sut.divine([query])
        expect(result).toBeArrayOfSize(1)
        const actual = result[0]
        expect(actual).toBeObject()
        expect(actual.schema).toBe(PayloadStatsDivinerSchema)
        expect(actual.count).toBeNumber()
      })
    })
  })
})
