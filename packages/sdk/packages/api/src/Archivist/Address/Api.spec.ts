import { XyoAccount } from '@xyo-network/account'

import { XyoApiConfig } from '../../models'
import { XyoAddressApi } from './Api'

const config: XyoApiConfig = {
  apiDomain: process.env.API_DOMAIN || 'http://localhost:8080',
}

describe('XyoAddressApi', () => {
  const address = new XyoAccount({ phrase: 'test' }).addressValue.hex
  describe('get', () => {
    it('method exists', () => {
      const api = new XyoAddressApi(config).address(address)
      expect(api).toBeDefined()
      expect(api.get).toBeFunction()
    })
  })
  describe('address', () => {
    describe('get', () => {
      it('method exists', () => {
        const api = new XyoAddressApi(config).address(address)
        expect(api).toBeDefined()
        expect(api.get).toBeFunction()
      })
    })
  })
})
