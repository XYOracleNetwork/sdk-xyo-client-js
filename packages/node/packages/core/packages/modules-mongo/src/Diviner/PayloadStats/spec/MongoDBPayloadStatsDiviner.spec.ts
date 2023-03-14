import { Account } from '@xyo-network/account'
import { AddressSpaceDiviner } from '@xyo-network/diviner'
import { PayloadStatsQueryPayload, PayloadStatsQuerySchema, PayloadStatsSchema } from '@xyo-network/node-core-model'
import { mock, MockProxy } from 'jest-mock-extended'

import { MongoDBArchivePayloadStatsDiviner, MongoDBArchivePayloadStatsDivinerConfigSchema } from '../MongoDBArchivePayloadStatsDiviner'

describe('MongoDBArchivePayloadStatsDiviner', () => {
  const phrase = 'test'
  const address = new Account({ phrase }).addressValue.hex
  const addressSpaceDiviner: MockProxy<AddressSpaceDiviner> = mock<AddressSpaceDiviner>()
  let sut: MongoDBArchivePayloadStatsDiviner
  beforeEach(async () => {
    sut = (await MongoDBArchivePayloadStatsDiviner.create({
      addressSpaceDiviner,
      config: { schema: MongoDBArchivePayloadStatsDivinerConfigSchema },
    })) as MongoDBArchivePayloadStatsDiviner
  })
  describe('divine', () => {
    describe('with valid query', () => {
      it('divines', async () => {
        const query: PayloadStatsQueryPayload = { archive: address, schema: PayloadStatsQuerySchema }
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
