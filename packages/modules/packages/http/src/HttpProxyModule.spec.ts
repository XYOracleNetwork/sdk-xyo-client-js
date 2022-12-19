import { AbstractModuleConfigSchema, AbstractModuleDiscoverQuerySchema, QueryBoundWitnessBuilder } from '@xyo-network/module'
import { AbstractNode, NodeWrapper, XyoNodeRegisteredQuerySchema } from '@xyo-network/node'
import { XyoPayloadBuilder } from '@xyo-network/payload'
import { XyoApiConfig } from '@xyo-network/sdk'

import { HttpProxyModule } from './HttpProxyModule'

describe('HttpProxyModule', () => {
  let sut: HttpProxyModule
  beforeAll(async () => {
    const apiConfig: XyoApiConfig = { apiDomain: process.env.API_DOMAIN || 'http://localhost:8080' }
    const params = { apiConfig, config: { schema: AbstractModuleConfigSchema } }
    sut = await HttpProxyModule.create(params)
  })
  describe('address', () => {
    it('returns module address', () => {
      expect(sut.address).toBeString()
    })
  })
  describe('config', () => {
    it('returns module config', () => {
      const config = sut.config
      expect(config).toBeObject()
      expect(config.schema).toBeString()
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
  describe('when wrapped by module wrapper', () => {
    it('returns module properties', () => {
      const node = new NodeWrapper(sut.as<AbstractNode>())
      expect(node.address).toBeString()
      expect(node.config).toBeObject()
    })
    it('issues module queries', async () => {
      const node = new NodeWrapper(sut.as<AbstractNode>())
      const registered = await node.registered()
      expect(registered).toBeArray()
      expect(registered.length).toBeGreaterThan(0)
    })
  })
})
