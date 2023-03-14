import { Account } from '@xyo-network/account'
import { AddressSpaceDiviner } from '@xyo-network/diviner'
import { PayloadStatsQueryPayload, PayloadStatsQuerySchema, PayloadStatsSchema } from '@xyo-network/node-core-model'
import { mock, MockProxy } from 'jest-mock-extended'

import { MongoDBAddressPayloadStatsDiviner, MongoDBAddressPayloadStatsDivinerConfigSchema } from '../MongoDBAddressPayloadStatsDiviner'

describe('MongoDBAddressPayloadStatsDiviner', () => {
  const phrase = 'temp'
  const address = new Account({ phrase }).addressValue.hex
  const addressSpaceDiviner: MockProxy<AddressSpaceDiviner> = mock<AddressSpaceDiviner>()
  const logger = mock<Console>()
  let sut: MongoDBAddressPayloadStatsDiviner
  beforeAll(async () => {
    sut = (await MongoDBAddressPayloadStatsDiviner.create({
      addressSpaceDiviner,
      config: { schema: MongoDBAddressPayloadStatsDivinerConfigSchema },
      logger,
    })) as MongoDBAddressPayloadStatsDiviner
  })
  describe('divine', () => {
    describe('with address supplied in query', () => {
      it('divines results for the address', async () => {
        const query: PayloadStatsQueryPayload = { address, schema: PayloadStatsQuerySchema }
        const result = await sut.divine([query])
        expect(result).toBeArrayOfSize(1)
        const actual = result[0]
        expect(actual).toBeObject()
        expect(actual.schema).toBe(PayloadStatsSchema)
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
        expect(actual.schema).toBe(PayloadStatsSchema)
        expect(actual.count).toBeNumber()
      })
    })
  })
})
