import { typeOf } from '../../lib'
import { XyoArchivistApi } from '../Archivist'
import { XyoApiConfig, XyoApiError } from '../models'
import { XyoUserApi } from './Api'

const timeout = 20000
const config: XyoApiConfig = {
  apiDomain: process.env.API_DOMAIN || 'http://localhost:8080',
  jwtToken: process.env.JWT_TOKEN || undefined,
}

const describeSkipIfNoToken = config.jwtToken ? describe : describe.skip

describe('XyoAuthApi', () => {
  describe('get', () => {
    it('returns a new XyoAuthApi', () => {
      const api = new XyoUserApi(config)
      expect(api).toBeDefined()
    })
  })

  describeSkipIfNoToken('walletChallenge', function () {
    it(
      'returns a nonce',
      async () => {
        const api = new XyoArchivistApi(config)
        try {
          const response = await api.wallet('0xfEf40940e776A3686Cb29eC712d60859EA9f99F7').challenge.post()
          expect(response?.state).toBeDefined()
          expect(typeOf(response?.state)).toBe('string')
        } catch (ex) {
          const error = ex as XyoApiError
          console.log(JSON.stringify(error.response?.data, null, 2))
          throw ex
        }
      },
      timeout
    )
  })
})
