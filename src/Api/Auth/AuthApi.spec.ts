import { AxiosError } from 'axios'

import { typeOf } from '../../lib'
import { XyoApiConfig } from '../models'
import { XyoAuthApi } from './AuthApi'

const timeout = 20000
const config: XyoApiConfig = {
  apiDomain: process.env.API_DOMAIN || 'http://localhost:8080',
  jwtToken: process.env.JWT_TOKEN || undefined,
}

const describeSkipIfNoToken = config.jwtToken ? describe : describe.skip

describe('XyoAuthApi', () => {
  describe('get', () => {
    it('returns a new XyoAuthApi', () => {
      const api = new XyoAuthApi(config)
      expect(api).toBeDefined()
    })
  })

  describeSkipIfNoToken('walletChallenge', function () {
    it(
      'returns a nonce',
      async () => {
        const api = new XyoAuthApi(config)
        try {
          const response = await api.walletChallenge('0xfEf40940e776A3686Cb29eC712d60859EA9f99F7')
          expect(response?.state).toBeDefined()
          expect(typeOf(response.state)).toBe('string')
        } catch (ex) {
          const error = ex as AxiosError
          console.log(JSON.stringify(error.response?.data, null, 2))
          throw ex
        }
      },
      timeout
    )
  })
})
