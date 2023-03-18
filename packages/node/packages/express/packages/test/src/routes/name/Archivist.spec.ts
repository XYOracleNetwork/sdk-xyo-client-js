import { AxiosJson } from '@xyo-network/axios'
import { uuid } from '@xyo-network/core'
import { getApp } from '@xyo-network/express-node-server'
import { HttpBridge, HttpBridgeConfigSchema, XyoHttpBridgeParams } from '@xyo-network/http-bridge'
import { ArchivistGetQuerySchema, ArchivistInsertQuerySchema, ArchivistWrapper } from '@xyo-network/modules'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { XyoPayload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { QueryPayload, QuerySchema } from '@xyo-network/query-payload-plugin'
import supertest, { SuperTest, Test } from 'supertest'

describe('/Archivist', () => {
  let req: SuperTest<Test>
  let archivist: ArchivistWrapper
  beforeAll(async () => {
    req = supertest(await getApp())
    const baseURL = req.get('/').url
    expect(baseURL).toBeTruthy()
    const axios = new AxiosJson({ baseURL })
    const name = ['Archivist']
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
    archivist = ArchivistWrapper.wrap(mod)
  })
  describe('ModuleDiscoverQuerySchema', () => {
    it('issues query', async () => {
      const response = await archivist.discover()
      expect(response).toBeArray()
      validateDiscoverResponseContainsQuerySchemas(response, [ArchivistGetQuerySchema, ArchivistInsertQuerySchema])
    })
  })
  describe('ArchivistInsertQuerySchema', () => {
    it('issues query', async () => {
      const payload = new PayloadBuilder({ schema: 'network.xyo.debug' }).fields({ nonce: uuid() }).build()
      const response = await archivist.insert([payload])
      expect(response).toBeArrayOfSize(1)
    })
  })
  describe('ArchivistGetQuerySchema', () => {
    const payload = new PayloadBuilder({ schema: 'network.xyo.debug' }).fields({ nonce: uuid() }).build()
    beforeAll(async () => {
      const result = await archivist.insert([payload])
      expect(result).toBeTruthy()
    })
    it('issues query', async () => {
      const hash = PayloadWrapper.parse(payload).hash
      const response = await archivist.get([hash])
      expect(response).toBeArrayOfSize(1)
      const actual = response.pop()
      expect(PayloadWrapper.parse(actual).hash).toBe(hash)
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
