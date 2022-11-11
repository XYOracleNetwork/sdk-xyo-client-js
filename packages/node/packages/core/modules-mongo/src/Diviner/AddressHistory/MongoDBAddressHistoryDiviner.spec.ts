import { XyoAccount } from '@xyo-network/account'
import { XyoArchivistPayloadDivinerConfigSchema } from '@xyo-network/diviner'
import { AddressHistoryQueryPayload, AddressHistoryQuerySchema, XyoBoundWitnessWithPartialMeta } from '@xyo-network/node-core-model'

import { MongoDBAddressHistoryDiviner } from './MongoDBAddressHistoryDiviner'

describe('MongoDBAddressHistoryDiviner', () => {
  const phrase = process.env.ACCOUNT_SEED
  const address = new XyoAccount({ phrase }).addressValue.hex
  let sut: MongoDBAddressHistoryDiviner
  beforeEach(async () => {
    sut = await MongoDBAddressHistoryDiviner.create({ config: { schema: XyoArchivistPayloadDivinerConfigSchema } })
  })
  describe('divine', () => {
    describe('with valid query', () => {
      it('divines', async () => {
        const query: AddressHistoryQueryPayload = { address, limit: 1, schema: AddressHistoryQuerySchema }
        const result = await sut.divine([query])
        expect(result).toBeArrayOfSize(1)
        const actual = result[0] as XyoBoundWitnessWithPartialMeta
        expect(actual).toBeObject()
        expect(actual.schema).toBe('network.xyo.boundwitness')
      })
    })
  })
})
