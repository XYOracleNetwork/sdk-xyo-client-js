import { Account } from '@xyo-network/account'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { AddressSpaceDiviner } from '@xyo-network/diviner'
import { BoundWitnessWithMeta, SchemaListQueryPayload, SchemaListQuerySchema, SchemaListSchema } from '@xyo-network/node-core-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { mock, MockProxy } from 'jest-mock-extended'

import { COLLECTIONS } from '../../../collections'
import { MongoDBSchemaListDiviner, MongoDBSchemaListDivinerConfigSchema } from '../MongoDBSchemaListDiviner'

describe('MongoDBSchemaListDiviner', () => {
  const phrase = 'temp'
  const account = new Account({ phrase })
  const address = account.addressValue.hex
  const addressSpaceDiviner: MockProxy<AddressSpaceDiviner> = mock<AddressSpaceDiviner>()
  const logger = mock<Console>()
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = new BaseMongoSdk<BoundWitnessWithMeta>({
    collection: COLLECTIONS.BoundWitnesses,
    dbConnectionString: process.env.MONGO_CONNECTION_STRING,
  })
  let sut: MongoDBSchemaListDiviner
  beforeAll(async () => {
    sut = await MongoDBSchemaListDiviner.create({
      addressSpaceDiviner,
      boundWitnessSdk,
      config: { schema: MongoDBSchemaListDivinerConfigSchema },
      logger,
    })
    // TODO: Insert via archivist
    const payload = new PayloadBuilder({ schema: 'network.xyo.test' }).build()
    const bw = new BoundWitnessBuilder().payload(payload).witness(account).build()[0]
    await boundWitnessSdk.insertOne(bw as unknown as BoundWitnessWithMeta)
  })
  describe('divine', () => {
    describe('with address supplied in query', () => {
      it('divines results for the address', async () => {
        const query: SchemaListQueryPayload = { address, schema: SchemaListQuerySchema }
        const result = await sut.divine([query])
        expect(result).toBeArrayOfSize(1)
        const actual = result[0]
        expect(actual).toBeObject()
        expect(actual.schema).toBe(SchemaListSchema)
        expect(actual.schemas).toBeArray()
        actual.schemas.map((schema) => {
          expect(schema).toBeString()
        })
      })
    })
    describe('with no address supplied in query', () => {
      it('divines results for all addresses', async () => {
        const query: SchemaListQueryPayload = { schema: SchemaListQuerySchema }
        const result = await sut.divine([query])
        expect(result).toBeArrayOfSize(1)
        const actual = result[0]
        expect(actual).toBeObject()
        expect(actual.schema).toBe(SchemaListSchema)
        expect(actual.schemas).toBeArray()
        actual.schemas.map((schema) => {
          expect(schema).toBeString()
        })
      })
    })
  })
})
