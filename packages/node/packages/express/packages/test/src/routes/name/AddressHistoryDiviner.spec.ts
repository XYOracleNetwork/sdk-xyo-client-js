import { uuid } from '@xyo-network/core'
import { DivinerWrapper, XyoDivinerDivineQuerySchema } from '@xyo-network/modules'
import { PayloadBuilder } from '@xyo-network/payload-builder'

import { getBridge, validateDiscoverResponseContainsQuerySchemas } from '../../testUtil'

const moduleName = 'AddressHistoryDiviner'

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
    it('issues query', async () => {
      const payload = new PayloadBuilder({ schema: 'network.xyo.debug' }).fields({ nonce: uuid() }).build()
      const response = await sut.divine([payload])
      expect(response).toBeArray()
      expect(response.length).toBeGreaterThan(0)
      const result = response.pop()
      expect(result).toBeObject()
    })
  })
})
