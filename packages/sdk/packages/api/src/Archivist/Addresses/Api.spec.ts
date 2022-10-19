import { XyoApiConfig, XyoApiResponseBody } from '../../models'
import { XyoAddressesApi } from './Api'
import { NodeModuleDescription } from './NodeModuleDescription'

const config: XyoApiConfig = {
  apiDomain: process.env.API_DOMAIN || 'http://localhost:8080',
}

describe('XyoAddressApi', () => {
  describe('get', () => {
    it('method exists', () => {
      const api = new XyoAddressesApi(config)
      expect(api).toBeDefined()
      expect(api.get).toBeFunction()
    })
    describe('returns', () => {
      let api: XyoAddressesApi
      let result: XyoApiResponseBody<NodeModuleDescription[]>
      beforeAll(async () => {
        api = new XyoAddressesApi(config)
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
})
