import { XyoAccount } from '@xyo-network/account'
import { Module } from '@xyo-network/modules'

import { XyoApiConfig, XyoApiResponseBody } from '../../models'
import { ModuleDescription, XyoAddressApi } from './Api'

const config: XyoApiConfig = {
  apiDomain: process.env.API_DOMAIN || 'http://localhost:8080',
}

describe('XyoAddressApi', () => {
  const address = new XyoAccount({ phrase: 'test' }).addressValue.hex
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
    })
  })
  describe('address', () => {
    describe('get', () => {
      it('method exists', () => {
        const api = new XyoAddressApi(config).address(address)
        expect(api).toBeDefined()
        expect(api.get).toBeFunction()
      })
      it('method exists', () => {
        const api = new XyoAddressApi(config).address(address)
        expect(api).toBeDefined()
        expect(api.get).toBeFunction()
      })
    })
  })
})
