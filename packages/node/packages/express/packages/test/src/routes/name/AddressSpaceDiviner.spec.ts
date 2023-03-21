import { Account } from '@xyo-network/account'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { uuid } from '@xyo-network/core'
import { AddressSpaceQueryPayload, AddressSpaceQuerySchema, DivinerWrapper, XyoDivinerDivineQuerySchema } from '@xyo-network/modules'
import { PayloadBuilder } from '@xyo-network/payload-builder'

import { getArchivist, getBridge, getNewPayload, validateDiscoverResponseContainsQuerySchemas } from '../../testUtil'
import { insertPayload } from '../../testUtil/Payload/insertPayload'

const moduleName = 'AddressSpaceDiviner'

describe(`/${moduleName}`, () => {
  let sut: DivinerWrapper
  beforeAll(async () => {
    const name = [moduleName]
    const modules = await (await getBridge()).downResolver.resolve({ name })
    expect(modules).toBeArrayOfSize(1)
    const mod = modules.pop()
    expect(mod).toBeTruthy()
    sut = DivinerWrapper.wrap(mod)
  })
  describe('ModuleDiscoverQuerySchema', () => {
    it('issues query', async () => {
      const response = await sut.discover()
      expect(response).toBeArray()
      validateDiscoverResponseContainsQuerySchemas(response, [XyoDivinerDivineQuerySchema])
    })
  })
  describe('XyoDivinerDivineQuerySchema', () => {
    const account = Account.random()
    beforeAll(async () => {
      for (let i = 0; i < 5; i++) {
        await insertPayload(getNewPayload(), account)
      }
    })
    it('issues query', async () => {
      const query: AddressSpaceQueryPayload = { schema: AddressSpaceQuerySchema }
      const response = await sut.divine([query])
      expect(response).toBeArray()
      expect(response.length).toBeGreaterThan(0)
      const addressPayloads = response.filter((p): p is AddressPayload => p.schema === AddressSchema)
      const addresses = addressPayloads.map((p) => p.address)
      expect(addresses).toBeArray()
      expect(addresses.length).toBeGreaterThan(0)
      expect(addresses).toContain(account.addressValue.hex)
    })
  })
})
