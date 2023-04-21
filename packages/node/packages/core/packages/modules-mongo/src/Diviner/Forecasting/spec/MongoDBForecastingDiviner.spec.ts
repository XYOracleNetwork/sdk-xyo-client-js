import { Account } from '@xyo-network/account'
import { ForecastingDivinerConfigSchema, ForecastingDivinerSchema, ForecastingQueryPayload, ForecastingQuerySchema } from '@xyo-network/diviner'
import { BoundWitnessWithMeta, JobQueue, PayloadWithMeta } from '@xyo-network/node-core-model'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { mock, MockProxy } from 'jest-mock-extended'

import { COLLECTIONS } from '../../../collections'
import { MongoDBForecastingDiviner } from '../MongoDBForecastingDiviner'

describe('MongoDBForecastingDiviner', () => {
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
  let sut: MongoDBForecastingDiviner
  beforeAll(async () => {
    sut = await MongoDBForecastingDiviner.create({
      boundWitnessSdk,
      config: { schema: ForecastingDivinerConfigSchema },
      jobQueue,
      logger,
      payloadSdk,
    })
  })
  describe('divine', () => {
    describe('with address supplied in query', () => {
      it('divines results for the address', async () => {
        const query: ForecastingQueryPayload = { address, schema: ForecastingQuerySchema }
        const result = await sut.divine([query])
        expect(result).toBeArrayOfSize(1)
        const actual = result[0]
        expect(actual).toBeObject()
        expect(actual.schema).toBe(ForecastingDivinerSchema)
        expect(actual.count).toBeNumber()
      })
    })
    describe('with no address supplied in query', () => {
      it('divines results for all addresses', async () => {
        const query: ForecastingQueryPayload = { schema: ForecastingQuerySchema }
        const result = await sut.divine([query])
        expect(result).toBeArrayOfSize(1)
        const actual = result[0]
        expect(actual).toBeObject()
        expect(actual.schema).toBe(ForecastingDivinerSchema)
        expect(actual.count).toBeNumber()
      })
    })
  })
})
