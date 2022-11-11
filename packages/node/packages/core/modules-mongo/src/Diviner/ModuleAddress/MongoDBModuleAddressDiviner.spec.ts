import { XyoDivinerConfigSchema } from '@xyo-network/diviner'
import { ModuleAddressPayload, ModuleAddressQueryPayload, ModuleAddressQuerySchema, ModuleAddressSchema } from '@xyo-network/node-core-model'

import { MongoDBModuleAddressDiviner } from './MongoDBModuleAddressDiviner'

describe('MongoDBModuleAddressDiviner', () => {
  let sut: MongoDBModuleAddressDiviner
  beforeEach(async () => {
    sut = await MongoDBModuleAddressDiviner.create({ config: { schema: XyoDivinerConfigSchema } })
  })
  describe('divine', () => {
    describe('with valid query', () => {
      it('divines', async () => {
        const query: ModuleAddressQueryPayload = { schema: ModuleAddressQuerySchema }
        const result = await sut.divine([query])
        expect(result).toBeArrayOfSize(1)
        const actual = result[0] as ModuleAddressPayload
        expect(actual).toBeObject()
        expect(actual.schema).toBe(ModuleAddressSchema)
      })
    })
  })
})
