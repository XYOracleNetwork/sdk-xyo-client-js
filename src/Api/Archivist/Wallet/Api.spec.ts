import { AxiosError } from 'axios'

import { typeOf } from '../../../lib'
import { XyoApiConfig } from '../../models'
import { XyoArchivistApi } from '../Api'
import { XyoWalletApi } from './Api'

const timeout = 20000
const config: XyoApiConfig = {
  apiDomain: process.env.API_DOMAIN || 'http://localhost:8080',
  jwtToken: process.env.JWT_TOKEN || undefined,
}

const describeSkipIfNoToken = config.jwtToken ? describe : describe.skip

describe('XyoAuthApi', () => {
  describe('get', () => {
    it('returns a new XyoWalletApi', () => {
      const api = new XyoWalletApi(config)
      expect(api).toBeDefined()
    })
  })

  describeSkipIfNoToken('challenge', function () {
    it(
      'returns a nonce',
      async () => {
        const api = new XyoArchivistApi(config)
        try {
          const response = (await api.wallet('0xfEf40940e776A3686Cb29eC712d60859EA9f99F7').challenge.post())?.pop()
          expect(response?.state).toBeDefined()
          expect(typeOf(response?.state)).toBe('string')
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
