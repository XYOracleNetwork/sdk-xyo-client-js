import { assertEx } from '@xylabs/assert'

import { XyoApiConfig, XyoApiResponseBody } from '../../models'
import { XyoApiSimple } from '../../Simple'
import { ModuleDescription, XyoAddressApi } from './Api'

const config: XyoApiConfig = {
  apiDomain: process.env.API_DOMAIN || 'http://localhost:8080',
}

describe('XyoAddressApi', () => {
  describe('get', () => {
    it('method exists', () => {
      const api = new XyoAddressApi(config)
      expect(api).toBeDefined()
      expect(api.get).toBeFunction()
    })
    describe('returns', () => {
      let api: XyoAddressApi
      let result: XyoApiResponseBody<ModuleDescription[]>
      beforeAll(async () => {
        api = new XyoAddressApi(config)
        result = await api.get()
      })
      it('modules in use on the node', () => {
        expect(result).toBeArray()
        expect(result?.length).toBeGreaterThan(0)
      })
      it('module addresses', () => {
        result?.map((module) => {
          expect(module.address).toBeString()
        })
      })
      it('supported module queries', () => {
        result?.map((module) => {
          expect(module.queries.length).toBeGreaterThan(0)
          module.queries.map((query) => {
            expect(query).toBeString()
          })
        })
      })
      it('module mount point', () => {
        result?.map((module) => {
          expect(module.url).toBeString
        })
      })
    })
  })
  describe('address', () => {
    describe('get', () => {
      let api: XyoApiSimple<ModuleDescription>
      let result: XyoApiResponseBody<ModuleDescription>
      beforeAll(async () => {
        const address = assertEx((await new XyoAddressApi(config).get())?.pop()?.address)
        api = new XyoAddressApi(config).address(address)
        result = await api.get()
        expect(result).toBeObject()
      })
      it('method exists', () => {
        expect(api).toBeDefined()
        expect(api.get).toBeFunction()
      })
      describe('returns', () => {
        it('module address', () => {
          expect(result?.address).toBeString()
        })
        it('module address', () => {
          const queries = result?.queries
          expect(queries).toBeArray()
          expect(queries?.length).toBeGreaterThan(0)
          queries?.map((query) => {
            expect(query).toBeString()
          })
        })
      })
    })
  })
})
