import { assertEx } from '@xylabs/assert'
import { XyoArchivistApi } from '@xyo-network/api'
import {
  AbstractModule,
  AbstractModuleConfigSchema,
  AbstractModuleDiscoverQuerySchema,
  ModuleWrapper,
  QueryBoundWitnessBuilder,
} from '@xyo-network/module'
import { XyoPayloadBuilder } from '@xyo-network/payload'
import { XyoApiConfig } from '@xyo-network/sdk'

import { HttpProxyModule } from './HttpProxyModule'
const apiConfig: XyoApiConfig = { apiDomain: process.env.API_DOMAIN || 'http://localhost:8080' }
const name = 'PayloadDiviner'

const createDefault = (): Promise<HttpProxyModule> => {
  return HttpProxyModule.create({ apiConfig, config: { schema: AbstractModuleConfigSchema } })
}
const createByAddress = async (): Promise<HttpProxyModule> => {
  const api = new XyoArchivistApi(apiConfig)
  const address = assertEx((await api.get())?.address)
  return HttpProxyModule.create({ address, apiConfig, config: { schema: AbstractModuleConfigSchema } })
}
const createByName = (): Promise<HttpProxyModule> => {
  return HttpProxyModule.create({ apiConfig, config: { schema: AbstractModuleConfigSchema }, name })
}

describe('HttpProxyModule', () => {
  let sut: HttpProxyModule
  describe.each([
    ['with default params', createDefault],
    ['with address supplied', createByAddress],
    ['with name supplied', createByName],
  ])('%s', (title, createFn) => {
    beforeAll(async () => {
      sut = await createFn()
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
        const queryPayload = new XyoPayloadBuilder({ schema: AbstractModuleDiscoverQuerySchema }).build()
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
        const node = new ModuleWrapper(sut.as<AbstractModule>())
        expect(node.address).toBeString()
        expect(node.config).toBeObject()
      })
      it('issues module queries', async () => {
        const node = new ModuleWrapper(sut.as<AbstractModule>())
        const registered = await node.discover()
        expect(registered).toBeArray()
        expect(registered.length).toBeGreaterThan(0)
      })
    })
  })
})
