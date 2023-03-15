import { XyoDivinerConfigSchema } from '@xyo-network/diviner-model'
import { ModuleAddressPayload, ModuleAddressQueryPayload, ModuleAddressQuerySchema, ModuleAddressSchema } from '@xyo-network/node-core-model'
import { mock } from 'jest-mock-extended'

import { MongoDBModuleAddressDiviner } from '../MongoDBModuleAddressDiviner'

describe('MongoDBModuleAddressDiviner', () => {
  const logger = mock<Console>()
  let sut: MongoDBModuleAddressDiviner
  beforeAll(async () => {
    sut = await MongoDBModuleAddressDiviner.create({ config: { schema: XyoDivinerConfigSchema }, logger })
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
