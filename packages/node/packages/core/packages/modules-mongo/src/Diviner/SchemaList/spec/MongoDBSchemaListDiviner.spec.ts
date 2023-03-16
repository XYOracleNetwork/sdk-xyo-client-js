import { Account } from '@xyo-network/account'
import { AddressSpaceDiviner } from '@xyo-network/diviner'
import { SchemaListQueryPayload, SchemaListQuerySchema, SchemaListSchema, XyoBoundWitnessWithMeta } from '@xyo-network/node-core-model'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { mock, MockProxy } from 'jest-mock-extended'

import { COLLECTIONS } from '../../../collections'
import { MongoDBSchemaListDiviner, MongoDBSchemaListDivinerConfigSchema } from '../MongoDBSchemaListDiviner'

describe('MongoDBSchemaListDiviner', () => {
  const phrase = 'temp'
  const address = new Account({ phrase }).addressValue.hex
  const addressSpaceDiviner: MockProxy<AddressSpaceDiviner> = mock<AddressSpaceDiviner>()
  const logger = mock<Console>()
  const boundWitnessSdk: BaseMongoSdk<XyoBoundWitnessWithMeta> = new BaseMongoSdk<XyoBoundWitnessWithMeta>({
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
        Object.entries(actual.schemas).map((schema) => {
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
        Object.entries(actual.schemas).map((schema) => {
          expect(schema).toBeString()
        })
      })
    })
  })
})
