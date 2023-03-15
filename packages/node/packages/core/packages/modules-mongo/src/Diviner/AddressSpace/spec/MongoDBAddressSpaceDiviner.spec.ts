import { Account } from '@xyo-network/account'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { AddressSpaceQueryPayload, AddressSpaceQuerySchema, XyoArchivistPayloadDivinerConfigSchema } from '@xyo-network/diviner'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { mock } from 'jest-mock-extended'

import { MongoDBAddressSpaceDiviner } from '../MongoDBAddressSpaceDiviner'

describe('MongoDBAddressSpaceDiviner', () => {
  const phrase = 'temp'
  const address = new Account({ phrase }).addressValue.hex
  const logger = mock<Console>()
  let sut: MongoDBAddressSpaceDiviner
  beforeAll(async () => {
    sut = await MongoDBAddressSpaceDiviner.create({
      config: { schema: XyoArchivistPayloadDivinerConfigSchema },
      logger,
    })
  })
  describe('divine', () => {
    describe('with valid query', () => {
      it('divines', async () => {
        const query: AddressSpaceQueryPayload = { address, limit: 1, schema: AddressSpaceQuerySchema }
        const result = await sut.divine([query])
        expect(result).toBeArray()
        expect(result.length).toBeGreaterThan(0)
        result.map((address) => {
          const payload = PayloadWrapper.parse<AddressPayload>(address)
          expect(payload.schema).toBe(AddressSchema)
          expect(payload.payload.address).toBeString()
        })
      })
    })
  })
})
