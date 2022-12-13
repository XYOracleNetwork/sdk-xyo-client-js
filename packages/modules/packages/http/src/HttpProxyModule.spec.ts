import { assertEx } from '@xylabs/assert'
import { XyoArchivistApi } from '@xyo-network/api'
import { AbstractModuleConfigSchema, AbstractModuleDiscoverQuerySchema, QueryBoundWitnessBuilder } from '@xyo-network/module'
import { XyoNodeRegisteredQuerySchema } from '@xyo-network/node'
import { XyoPayloadBuilder } from '@xyo-network/payload'

import { HttpProxyModule } from './HttpProxyModule'

describe('HttpProxyModule', () => {
  let sut: HttpProxyModule
  beforeAll(async () => {
    const api: XyoArchivistApi = new XyoArchivistApi({
      apiDomain: 'http://localhost:8080',
    })
    const address = assertEx((await api.get())?.address)
    sut = await HttpProxyModule.create({ address, api, config: { schema: AbstractModuleConfigSchema } })
  })
  describe('address', () => {
    it('returns module address', () => {
      expect(sut.address).toBeString()
    })
  })
  describe('description', () => {
    it('returns module description', async () => {
      const description = await sut.description()
      expect(description).toBeObject()
      expect(description.address).toBeString()
      expect(description.queries).toBeArray()
      expect(description.queries.length).toBeGreaterThan(0)
    })
  })
  describe('queries', () => {
    it('returns supported module queries', () => {
      const queries = sut.queries()
      expect(queries).toBeArray()
      expect(queries.length).toBeGreaterThan(0)
      expect(queries).toContain(AbstractModuleDiscoverQuerySchema)
    })
  })
  describe('query', () => {
    it('queries the module', async () => {
      const queryPayload = new XyoPayloadBuilder({ schema: XyoNodeRegisteredQuerySchema }).build()
      const query = new QueryBoundWitnessBuilder({ inlinePayloads: true }).query(queryPayload).build()
      const response = await sut.query(query[0], [...query[1]])
      expect(response).toBeTruthy()
      expect(response).toBeArray()
      expect(response.length).toBeGreaterThan(0)
    })
  })
  describe('queryable', () => {
    it('returns true for supported queries', () => {
      const response = sut.queryable(AbstractModuleDiscoverQuerySchema)
      expect(response).toBeTrue()
    })
    it('returns false for unsupported queries', () => {
      const response = sut.queryable('foo.bar.baz')
      expect(response).toBeFalse()
    })
  })
})
