import { XyoArchivistPayloadDivinerConfigSchema } from '@xyo-network/diviner'
import { BoundWitnessWithPartialMeta, PayloadQueryPayload, PayloadQuerySchema, PayloadWithMeta } from '@xyo-network/node-core-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { mock } from 'jest-mock-extended'

import { COLLECTIONS } from '../../../collections'
import { MongoDBPayloadDiviner } from '../MongoDBPayloadDiviner'

describe('MongoDBPayloadDiviner', () => {
  const logger = mock<Console>()
  const payloadSdk: BaseMongoSdk<PayloadWithMeta> = new BaseMongoSdk<PayloadWithMeta>({
    collection: COLLECTIONS.Payloads,
    dbConnectionString: process.env.MONGO_CONNECTION_STRING,
  })
  let sut: MongoDBPayloadDiviner
  beforeAll(async () => {
    sut = await MongoDBPayloadDiviner.create({
      config: { schema: XyoArchivistPayloadDivinerConfigSchema },
      logger,
      payloadSdk,
    })
    // TODO: Insert via archivist
    const payload = new PayloadBuilder({ schema: 'network.xyo.test' }).build()
    await payloadSdk.insertOne(payload as unknown as PayloadWithMeta)
  })
  describe('divine', () => {
    describe('with valid query', () => {
      it('divines', async () => {
        const query: PayloadQueryPayload = { limit: 1, schema: PayloadQuerySchema }
        const result = await sut.divine([query])
        expect(result).toBeArrayOfSize(1)
        const actual = result[0] as BoundWitnessWithPartialMeta
        expect(actual).toBeObject()
        expect(actual.schema).toBeDefined()
        expect(actual.schema).toBeString()
      })
    })
  })
})
