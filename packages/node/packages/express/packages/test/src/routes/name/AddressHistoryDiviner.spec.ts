import { AxiosJson } from '@xyo-network/axios'
import { uuid } from '@xyo-network/core'
import { getApp } from '@xyo-network/express-node-server'
import { HttpBridge, HttpBridgeConfigSchema, XyoHttpBridgeParams } from '@xyo-network/http-bridge'
import { DivinerWrapper, XyoDivinerDivineQuerySchema } from '@xyo-network/modules'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { XyoPayload } from '@xyo-network/payload-model'
import { QueryPayload, QuerySchema } from '@xyo-network/query-payload-plugin'
import supertest, { SuperTest, Test } from 'supertest'

const moduleName = 'AddressHistoryDiviner'

describe(`/${moduleName}`, () => {
  let req: SuperTest<Test>
  let sut: DivinerWrapper
  beforeAll(async () => {
    req = supertest(await getApp())
    const baseURL = req.get('/').url
    expect(baseURL).toBeTruthy()
    const axios = new AxiosJson({ baseURL })
    const name = [moduleName]
    const nodeUri = '/node'
    const schema = HttpBridgeConfigSchema
    const security = { allowAnonymous: true }
    const config = { nodeUri, schema, security }
    const params: XyoHttpBridgeParams = { axios, config }
    const bridge = await HttpBridge.create(params)
    const modules = await bridge.downResolver.resolve({ name })
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

// TODO: Move to helpers lib
const validateDiscoverResponseContainsQuerySchemas = (response: XyoPayload[], querySchemas: string[]) => {
  const queries = response.filter<QueryPayload>((p): p is QueryPayload => p.schema === QuerySchema)
  expect(queries.length).toBeGreaterThan(0)
  querySchemas.forEach((querySchema) => {
    expect(queries.some((p) => p.query === querySchema)).toBeTrue()
  })
}
