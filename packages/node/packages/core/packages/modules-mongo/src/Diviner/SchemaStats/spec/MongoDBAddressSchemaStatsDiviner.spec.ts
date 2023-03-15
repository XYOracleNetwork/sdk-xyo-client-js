import { Account } from '@xyo-network/account'
import { AddressSpaceDiviner } from '@xyo-network/diviner'
import { BoundWitnessStatsQueryPayload, BoundWitnessStatsQuerySchema, BoundWitnessStatsSchema } from '@xyo-network/node-core-model'
import { mock, MockProxy } from 'jest-mock-extended'

import { MongoDBAddressSchemaStatsDiviner, MongoDBAddressSchemaStatsDivinerConfigSchema } from '../MongoDBAddressSchemaStatsDiviner'

describe('MongoDBAddressSchemaStatsDiviner', () => {
  const phrase = 'temp'
  const address = new Account({ phrase }).addressValue.hex
  const addressSpaceDiviner: MockProxy<AddressSpaceDiviner> = mock<AddressSpaceDiviner>()
  const logger = mock<Console>()
  let sut: MongoDBAddressSchemaStatsDiviner
  beforeAll(async () => {
    sut = (await MongoDBAddressSchemaStatsDiviner.create({
      addressSpaceDiviner,
      config: { schema: MongoDBAddressSchemaStatsDivinerConfigSchema },
      logger,
    })) as MongoDBAddressSchemaStatsDiviner
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
