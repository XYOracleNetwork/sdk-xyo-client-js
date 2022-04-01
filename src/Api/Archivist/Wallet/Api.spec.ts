import { XyoAddress } from '../../../core'
import { typeOf } from '../../../lib'
import { XyoApiConfig, XyoApiError } from '../../models'
import { XyoArchivistApi } from '../Api'
import { XyoWalletApi } from './Api'

const timeout = 20000
const config: XyoApiConfig = {
  apiDomain: process.env.API_DOMAIN || 'http://localhost:8080',
  jwtToken: process.env.JWT_TOKEN || undefined,
}

//const describeSkipIfNoToken = config.jwtToken ? describe : describe.skip

describe('XyoAuthApi', () => {
  describe('get', () => {
    it('returns a new XyoWalletApi', () => {
      const api = new XyoWalletApi(config)
      expect(api).toBeDefined()
    })
  })

  describe('challenge', function () {
    it(
      'success',
      async () => {
        const api = new XyoArchivistApi(config)
        try {
          const address = XyoAddress.random()
          const [data, envelope, response] = await api.wallet(address.address).challenge.post(undefined, 'tuple')
          expect(response.status).toBe(200)
          expect(envelope.error).toBeUndefined()
          expect(typeOf(data?.state)).toBe('string')
        } catch (ex) {
          const error = ex as XyoApiError
          console.log(JSON.stringify(error.response?.data, null, 2))
          throw ex
        }
      },
      timeout
    )
  })

  /*describe('verify', function () {
    it(
      'success',
      async () => {
        const api = new XyoArchivistApi(config)
        try {
          const address = XyoAddress.random()
          const challenge = (await api.wallet(address.address).challenge.post(undefined))?.pop()
          const message = assertEx(challenge?.state)
          const [data, envelope, response] = await api
            .wallet(`0x${address.address}`)
            .verify.post(
              [{ message: assertEx(challenge?.state), signature: `0x${address.signKeccakMessage(message)}` }],
              'tuple'
            )
          expect(response.status).toBe(200)
          expect(envelope.error).toBeUndefined()
          expect(data?.length).toBe(1)
        } catch (ex) {
          const error = ex as AxiosError
          console.log(JSON.stringify(error.response?.data, null, 2))
          throw ex
        }
      },
      timeout
    )
  })*/
})
