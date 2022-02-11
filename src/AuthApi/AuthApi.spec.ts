import { AxiosError } from 'axios'

import { XyoAuthApi } from './AuthApi'
import { XyoAuthApiConfig } from './AuthApiConfig'

const timeout = 20000
const config: XyoAuthApiConfig = {
  apiDomain: process.env.API_DOMAIN || 'http://localhost:8080',
  apiKey: process.env.API_KEY || undefined,
  jwtToken: process.env.JWT_TOKEN || undefined,
  token: process.env.TOKEN || undefined,
}

const describeSkipIfNoToken = config.token ? describe : describe.skip

describe('XyoAuthApi', () => {
  describe('get', () => {
    it('returns a new XyoAuthApi', () => {
      const api = XyoAuthApi.get(config)
      expect(api).toBeDefined()
    })
  })

  describeSkipIfNoToken('walletChallenge', function () {
    it(
      'returns a nonce',
      async () => {
        const api = XyoAuthApi.get(config)
        try {
          const response = await api.walletChallenge('0xfEf40940e776A3686Cb29eC712d60859EA9f99F7')
          expect(response.data).toBeDefined()
          expect(typeof response.data).toBe('string')
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
