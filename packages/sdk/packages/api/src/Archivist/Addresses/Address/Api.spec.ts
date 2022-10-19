import { assertEx } from '@xylabs/assert'

import { XyoApiConfig, XyoApiResponseBody } from '../../../models'
import { XyoAddressesApi } from '../Api'
import { ModuleDescription } from '../ModuleDescription'
import { XyoAddressApi } from './Api'

const config: XyoApiConfig = {
  apiDomain: process.env.API_DOMAIN || 'http://localhost:8080',
}

describe('XyoAddressApi', () => {
  describe('get', () => {
    let api: XyoAddressApi
    let result: XyoApiResponseBody<ModuleDescription>
    beforeAll(async () => {
      const address = assertEx((await new XyoAddressesApi(config).get())?.pop()?.address)
      api = new XyoAddressesApi(config).address(address)
      result = await api.get()
      expect(result).toBeObject()
    })
    it('method exists', () => {
      expect(api).toBeDefined()
      expect(api.get).toBeFunction()
    })
    describe('returns module', () => {
      it('address', () => {
        expect(result?.address).toBeString()
      })
      it('supported queries', () => {
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
