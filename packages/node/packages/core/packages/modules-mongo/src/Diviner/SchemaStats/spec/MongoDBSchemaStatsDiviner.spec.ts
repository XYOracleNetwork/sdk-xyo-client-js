import { describeIf } from '@xylabs/jest-helpers'
import { Account } from '@xyo-network/account'
import {
  SchemaStatsDivinerConfigSchema,
  SchemaStatsDivinerSchema,
  SchemaStatsQueryPayload,
  SchemaStatsQuerySchema,
} from '@xyo-network/diviner-schema-stats-model'
import { BoundWitnessWithMeta, JobQueue, PayloadWithMeta } from '@xyo-network/node-core-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { mock, MockProxy } from 'jest-mock-extended'

import { canAddMongoModules } from '../../../canAddMongoModules'
import { COLLECTIONS } from '../../../collections'
import { MongoDBSchemaStatsDiviner } from '../MongoDBSchemaStatsDiviner'

describeIf(canAddMongoModules())('MongoDBSchemaStatsDiviner', () => {
  const phrase = 'temp'
  const address = Account.create({ phrase }).addressValue.hex
  const logger = mock<Console>()
  const boundWitnessSdk = new BaseMongoSdk<BoundWitnessWithMeta>({
    collection: COLLECTIONS.BoundWitnesses,
    dbConnectionString: process.env.MONGO_CONNECTION_STRING,
  })
  const payloadSdk: BaseMongoSdk<PayloadWithMeta> = new BaseMongoSdk<PayloadWithMeta>({
    collection: COLLECTIONS.Payloads,
    dbConnectionString: process.env.MONGO_CONNECTION_STRING,
  })
  const jobQueue: MockProxy<JobQueue> = mock<JobQueue>()
  let sut: MongoDBSchemaStatsDiviner
  beforeAll(async () => {
    sut = await MongoDBSchemaStatsDiviner.create({
      boundWitnessSdk,
      config: { schema: SchemaStatsDivinerConfigSchema },
      jobQueue,
      logger,
    })
    // TODO: Insert via archivist
    const payload = new PayloadBuilder({ schema: 'network.xyo.test' }).build()
    await payloadSdk.insertOne(payload as unknown as PayloadWithMeta)
  })
  describe('divine', () => {
    describe('with address supplied in query', () => {
      it('divines results for the address', async () => {
        const query: SchemaStatsQueryPayload = { address, schema: SchemaStatsQuerySchema }
        const result = await sut.divine([query])
        expect(result).toBeArrayOfSize(1)
        const actual = result[0]
        expect(actual).toBeObject()
        expect(actual.schema).toBe(SchemaStatsDivinerSchema)
        expect(actual.count).toBeObject()
        Object.entries(actual.count).map((entry) => {
          expect(entry[0]).toBeString()
          expect(entry[1]).toBeNumber()
        })
      })
    })
    describe('with no address supplied in query', () => {
      it('is not implemented', async () => {
        const query: SchemaStatsQueryPayload = { schema: SchemaStatsQuerySchema }
        await expect(sut.divine([query])).rejects.toBe('Not Implemented')
      })
    })
  })
})
