import { uuid } from '@xyo-network/core'
import { AddressSpaceQueryPayload, AddressSpaceQuerySchema, DivinerWrapper, XyoDivinerDivineQuerySchema } from '@xyo-network/modules'
import { PayloadBuilder } from '@xyo-network/payload-builder'

import { getArchivist, getBridge, validateDiscoverResponseContainsQuerySchemas } from '../../testUtil'

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
  describe.skip('XyoDivinerDivineQuerySchema', () => {
    let address: string
    beforeAll(async () => {
      const archivist = await getArchivist()
      for (let i = 0; i < 10; i++) {
        const payload = new PayloadBuilder({ schema: 'network.xyo.debug' }).fields({ nonce: uuid() }).build()
        await archivist.insert([payload])
      }
      address = archivist.address
    })
    it('issues query', async () => {
      const query: AddressSpaceQueryPayload = { address, limit: 1, schema: AddressSpaceQuerySchema }
      const response = await sut.divine([query])
      expect(response).toBeArray()
      expect(response.length).toBeGreaterThan(0)
      const result = response.pop()
      expect(result).toBeObject()
    })
  })
})
