import { assertEx } from '@xylabs/assert'
import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { XyoArchivistApi } from '@xyo-network/api'
import { Module, ModuleDiscoverQuerySchema, ModuleWrapper, QueryBoundWitnessBuilder } from '@xyo-network/module'
import { XyoPayloadBuilder } from '@xyo-network/payload-builder'
import { XyoApiConfig } from '@xyo-network/sdk'

import { HttpProxyModuleConfigSchema } from '../Config'
import { HttpProxyModule } from '../HttpProxyModule'

const apiConfig: XyoApiConfig = { apiDomain: process.env.API_DOMAIN || 'http://localhost:8080' }
const name = 'PayloadDiviner'

const createDefault = (): Promise<HttpProxyModule> => {
  return HttpProxyModule.create({ apiConfig, config: { schema: HttpProxyModuleConfigSchema } })
}
const createByAddress = async (): Promise<HttpProxyModule> => {
  const api = new XyoArchivistApi(apiConfig)
  const response = await api.get()
  const addressPayload = response?.find((p) => p.schema === AddressSchema) as AddressPayload
  expect(addressPayload).toBeObject()
  expect(addressPayload.address).toBeString()
  const { address } = addressPayload
  return HttpProxyModule.create({ apiConfig, config: { address, schema: HttpProxyModuleConfigSchema } })
}
const createByName = (): Promise<HttpProxyModule> => {
  return HttpProxyModule.create({ apiConfig, config: { schema: HttpProxyModuleConfigSchema }, name })
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
        const wrapper = ModuleWrapper.wrap(sut)
        const description = await wrapper.describe()
        expect(description).toBeObject()
        expect(description.address).toBeString()
        expect(description.queries).toBeArray()
        expect(description.queries.length).toBeGreaterThan(0)
      })
    })
    describe('queries', () => {
      it('returns supported module queries', () => {
        const queries = sut.queries
        expect(queries).toBeArray()
        expect(queries.length).toBeGreaterThan(0)
        expect(queries).toContain(ModuleDiscoverQuerySchema)
      })
    })
    describe('query', () => {
      it('queries the module', async () => {
        const queryPayload = new XyoPayloadBuilder({ schema: ModuleDiscoverQuerySchema }).build()
        const query = new QueryBoundWitnessBuilder({ inlinePayloads: true }).query(queryPayload).build()
        const response = await sut.query(query[0], [...query[1]])
        expect(response).toBeTruthy()
        expect(response).toBeArray()
        expect(response.length).toBeGreaterThan(0)
      })
    })
    describe('queryable', () => {
      it('returns true for supported queries', async () => {
        const queryPayload = new XyoPayloadBuilder({ schema: ModuleDiscoverQuerySchema }).build()
        const query = new QueryBoundWitnessBuilder({ inlinePayloads: true }).query(queryPayload).build()
        const response = await sut.queryable(query[0], [...query[1]])
        expect(response).toBeTrue()
      })
      it('returns false for unsupported queries', async () => {
        const queryPayload = new XyoPayloadBuilder({ schema: 'foo.bar.baz' }).build()
        const query = new QueryBoundWitnessBuilder({ inlinePayloads: true }).query(queryPayload).build()
        const response = await sut.queryable(query[0], [...query[1]])
        expect(response).toBeFalse()
      })
    })
    describe('when wrapped by module wrapper', () => {
      it('returns module properties', () => {
        const node = new ModuleWrapper(sut.as<Module>())
        expect(node.address).toBeString()
        expect(node.config).toBeObject()
      })
      it('issues module queries', async () => {
        const node = new ModuleWrapper(sut.as<Module>())
        const registered = await node.discover()
        expect(registered).toBeArray()
        expect(registered.length).toBeGreaterThan(0)
      })
    })
  })
})
