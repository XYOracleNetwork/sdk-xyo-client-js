import { Account } from '@xyo-network/account'
import { XyoBoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { AddressSpaceQueryPayload, AddressSpaceQuerySchema, XyoArchivistPayloadDivinerConfigSchema } from '@xyo-network/diviner'
import { XyoBoundWitnessWithPartialMeta } from '@xyo-network/node-core-model'

import { MongoDBAddressSpaceDiviner } from '../MongoDBAddressSpaceDiviner'

describe('MongoDBAddressSpaceDiviner', () => {
  const phrase = 'test'
  const address = new Account({ phrase }).addressValue.hex
  let sut: MongoDBAddressSpaceDiviner
  beforeEach(async () => {
    sut = await MongoDBAddressSpaceDiviner.create({ config: { schema: XyoArchivistPayloadDivinerConfigSchema } })
  })
  describe('divine', () => {
    describe('with valid query', () => {
      it('divines', async () => {
        const query: AddressSpaceQueryPayload = { address, limit: 1, schema: AddressSpaceQuerySchema }
        const result = await sut.divine([query])
        expect(result).toBeArrayOfSize(1)
        const actual = result[0] as XyoBoundWitnessWithPartialMeta
        expect(actual).toBeObject()
        expect(actual.schema).toBe(XyoBoundWitnessSchema)
      })
    })
  })
})
