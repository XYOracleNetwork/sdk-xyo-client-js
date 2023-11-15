import { describeIf } from '@xylabs/jest-helpers'
import { Account } from '@xyo-network/account'
import { PayloadDivinerConfigSchema, PayloadDivinerQueryPayload, PayloadDivinerQuerySchema } from '@xyo-network/diviner-payload-model'
import { COLLECTIONS, hasMongoDBConfig } from '@xyo-network/module-abstract-mongodb'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { PayloadWithMeta } from '@xyo-network/payload-mongodb'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { mock } from 'jest-mock-extended'

import { MongoDBPayloadDiviner } from '../MongoDBPayloadDiviner'

/**
 * @group mongo
 */

describeIf(hasMongoDBConfig())('MongoDBPayloadDiviner', () => {
  const testSchema = 'network.xyo.test'
  const logger = mock<Console>()
  const payloadSdk: BaseMongoSdk<PayloadWithMeta> = new BaseMongoSdk<PayloadWithMeta>({
    collection: COLLECTIONS.Payloads,
    dbConnectionString: process.env.MONGO_CONNECTION_STRING,
  })
  const url = 'https://xyo.network'
  let sut: MongoDBPayloadDiviner
  beforeAll(async () => {
    sut = await MongoDBPayloadDiviner.create({
      account: Account.randomSync(),
      config: { schema: PayloadDivinerConfigSchema },
      logger,
    })
    // TODO: Insert via archivist
    const payload = new PayloadBuilder<{ schema: string; url: string }>({ schema: testSchema }).fields({ url }).build()
    await payloadSdk.insertOne(payload as unknown as PayloadWithMeta)
  })
  describe('divine', () => {
    describe('with valid query', () => {
      it('divines', async () => {
        const query: PayloadDivinerQueryPayload = { limit: 1, schema: PayloadDivinerQuerySchema, schemas: [testSchema] }
        const result = await sut.divine([query])
        expect(result).toBeArrayOfSize(1)
        const actual = result[0]
        expect(actual).toBeObject()
        expect(actual.schema).toBeDefined()
        expect(actual.schema).toBeString()
      })
    })
    describe('with custom query prop', () => {
      it('returns payloads matching the filter criteria', async () => {
        const query: PayloadDivinerQueryPayload & { url: string } = { limit: 1, schema: PayloadDivinerQuerySchema, url }
        const result = await sut.divine([query])
        expect(result).toBeArrayOfSize(1)
        const actual = result[0]
        expect(actual).toBeObject()
        expect(actual.schema).toBeDefined()
        expect(actual.schema).toBeString()
        expect((actual as { url?: string })?.url).toBe(url)
      })
      it('does not return payloads not matching the filter criteria', async () => {
        const query: PayloadDivinerQueryPayload & { url: string } = { limit: 1, schema: PayloadDivinerQuerySchema, url: 'https://foo.bar' }
        const result = await sut.divine([query])
        expect(result).toBeArrayOfSize(0)
      })
    })
  })
})
