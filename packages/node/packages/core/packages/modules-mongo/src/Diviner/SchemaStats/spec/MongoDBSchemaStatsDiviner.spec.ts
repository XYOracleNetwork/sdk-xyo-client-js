import { Account } from '@xyo-network/account'
import { AddressSpaceDiviner } from '@xyo-network/diviner'
import { SchemaStatsQueryPayload, SchemaStatsQuerySchema, SchemaStatsSchema, XyoPayloadWithMeta } from '@xyo-network/node-core-model'
import { XyoPayloadBuilder } from '@xyo-network/payload-builder'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { mock, MockProxy } from 'jest-mock-extended'

import { COLLECTIONS } from '../../../collections'
import { MongoDBSchemaStatsDiviner, MongoDBSchemaStatsDivinerConfigSchema } from '../MongoDBSchemaStatsDiviner'

describe('MongoDBSchemaStatsDiviner', () => {
  const phrase = 'temp'
  const address = new Account({ phrase }).addressValue.hex
  const addressSpaceDiviner: MockProxy<AddressSpaceDiviner> = mock<AddressSpaceDiviner>()
  const logger = mock<Console>()
  const payloadSdk: BaseMongoSdk<XyoPayloadWithMeta> = new BaseMongoSdk<XyoPayloadWithMeta>({
    collection: COLLECTIONS.Payloads,
    dbConnectionString: process.env.MONGO_CONNECTION_STRING,
  })
  let sut: MongoDBSchemaStatsDiviner
  beforeAll(async () => {
    sut = await MongoDBSchemaStatsDiviner.create({
      addressSpaceDiviner,
      config: { schema: MongoDBSchemaStatsDivinerConfigSchema },
      logger,
      payloadSdk,
    })
    // TODO: Insert via archivist
    const payload = new XyoPayloadBuilder({ schema: 'network.xyo.test' }).build()
    await payloadSdk.insertOne(payload as unknown as XyoPayloadWithMeta)
  })
  describe('divine', () => {
    describe('with address supplied in query', () => {
      it('divines results for the address', async () => {
        const query: SchemaStatsQueryPayload = { address, schema: SchemaStatsQuerySchema }
        const result = await sut.divine([query])
        expect(result).toBeArrayOfSize(1)
        const actual = result[0]
        expect(actual).toBeObject()
        expect(actual.schema).toBe(SchemaStatsSchema)
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
