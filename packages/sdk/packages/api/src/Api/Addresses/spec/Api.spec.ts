import { AddressPayload, AddressSchema } from '@xyo-network/address-payload-plugin'
import { XyoApiConfig, XyoApiResponseBody } from '@xyo-network/api-models'
import { XyoPayloads } from '@xyo-network/payload-model'
import { QueryPayload, QuerySchema } from '@xyo-network/query-payload-plugin'

import { XyoAddressesApi } from '../Api'

const config: XyoApiConfig = {
  apiDomain: process.env.API_DOMAIN || 'http://localhost:8080',
}

describe('XyoAddressesApi', () => {
  describe('get', () => {
    it('method exists', () => {
      const api = new XyoAddressesApi(config)
      expect(api).toBeDefined()
      expect(api.get).toBeFunction()
    })
    describe('returns root module discover containing', () => {
      let api: XyoAddressesApi
      let response: XyoApiResponseBody<XyoPayloads>
      beforeAll(async () => {
        api = new XyoAddressesApi(config)
        response = await api.get()
      })
      it('address', () => {
        expect(response).toBeArray()
        const addressPayload = response?.find((p) => p.schema === AddressSchema) as AddressPayload
        expect(addressPayload).toBeObject()
        expect(addressPayload.address).toBeString()
      })
      it('supported queries', () => {
        const queries = response?.filter((d) => d.schema === QuerySchema) as QueryPayload[]
        expect(queries.length).toBeGreaterThan(0)
      })
    })
  })
})
