import { Account } from '@xyo-network/account'
import { XyoApiConfig } from '@xyo-network/api-models'
import { typeOf } from '@xyo-network/typeof'

import { XyoArchivistApi } from '../Api'
import { XyoAccountApi } from './Api'

const timeout = 20000
const config: XyoApiConfig = {
  apiDomain: process.env.API_DOMAIN || 'http://localhost:8080',
}

describe('XyoAuthApi', () => {
  describe('get', () => {
    it('returns a new XyoWalletApi', () => {
      const api = new XyoAccountApi(config)
      expect(api).toBeDefined()
    })
  })

  describe('challenge', function () {
    it(
      'success',
      async () => {
        const api = new XyoArchivistApi(config)
        const account = Account.random()
        const [data, envelope, response] = await api.account(account.addressValue.hex).challenge.post(undefined, 'tuple')
        expect(response.status).toBe(200)
        expect(envelope.error).toBeUndefined()
        expect(typeOf(data?.state)).toBe('string')
      },
      timeout,
    )
  })

  /*describe('verify', function () {
    it(
      'success',
      async () => {
        const api = new XyoArchivistApi(config)
        const address = XyoAddress.random()
        const challenge = (await api.wallet(address.address).challenge.post(undefined))
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

      },
      timeout
    )
  })*/
})
