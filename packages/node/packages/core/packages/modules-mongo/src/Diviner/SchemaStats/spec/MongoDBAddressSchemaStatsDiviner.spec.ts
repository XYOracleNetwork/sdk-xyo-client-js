import { Account } from '@xyo-network/account'
import { AddressSpaceDiviner } from '@xyo-network/diviner'
import { SchemaStatsQueryPayload, SchemaStatsQuerySchema, SchemaStatsSchema } from '@xyo-network/node-core-model'
import { mock, MockProxy } from 'jest-mock-extended'

import { MongoDBAddressSchemaStatsDiviner, MongoDBAddressSchemaStatsDivinerConfigSchema } from '../MongoDBAddressSchemaStatsDiviner'

describe('MongoDBAddressSchemaStatsDiviner', () => {
  const phrase = 'temp'
  const address = new Account({ phrase }).addressValue.hex
  const addressSpaceDiviner: MockProxy<AddressSpaceDiviner> = mock<AddressSpaceDiviner>()
  const logger = mock<Console>()
  let sut: MongoDBAddressSchemaStatsDiviner
  beforeAll(async () => {
    sut = await MongoDBAddressSchemaStatsDiviner.create({
      addressSpaceDiviner,
      config: { schema: MongoDBAddressSchemaStatsDivinerConfigSchema },
      logger,
    })
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
