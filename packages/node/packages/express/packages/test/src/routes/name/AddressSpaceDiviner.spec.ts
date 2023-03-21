import { Account } from '@xyo-network/account'
import { AccountInstance } from '@xyo-network/account-model'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { AddressSpaceQueryPayload, AddressSpaceQuerySchema, DivinerWrapper, XyoDivinerDivineQuerySchema } from '@xyo-network/modules'

import { getBridge, getNewPayload, insertPayload, validateDiscoverResponseContainsQuerySchemas } from '../../testUtil'

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
    const accounts: AccountInstance[] = []
    beforeAll(async () => {
      for (let i = 0; i < 5; i++) {
        const account = Account.random()
        accounts.push(account)
        await insertPayload(getNewPayload(), account)
      }
    })
    it('returns addresses in use', async () => {
      const query: AddressSpaceQueryPayload = { schema: AddressSpaceQuerySchema }
      const response = await sut.divine([query])
      expect(response).toBeArray()
      expect(response.length).toBeGreaterThan(0)
      const addressPayloads = response.filter((p): p is AddressPayload => p.schema === AddressSchema)
      const addresses = addressPayloads.map((p) => p.address)
      expect(addresses).toBeArray()
      expect(addresses.length).toBeGreaterThan(0)
      expect(addresses).toIncludeAllMembers(accounts.map((account) => account.addressValue.hex))
    })
  })
})
