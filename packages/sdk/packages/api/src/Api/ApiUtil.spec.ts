import { Wallet } from '@ethersproject/wallet'
import { assertEx } from '@xylabs/assert'
import { Account } from '@xyo-network/account'
import { XyoApiConfig } from '@xyo-network/api-models'
import { uuid } from '@xyo-network/core'

import { XyoArchivistApi } from './Api'

test('Must have tests defined', () => {
  expect(true).toBeTruthy()
})

export const getApiConfig = (configData: Partial<XyoApiConfig> = {}): XyoApiConfig => {
  const defaults: XyoApiConfig = {
    apiDomain: process.env.API_DOMAIN || 'http://localhost:8080',
    onError: (error) => error,
    onFailure: (response) => response,
    onSuccess: (response) => response,
  }
  return Object.assign({}, defaults, configData)
}

export const getApi = (configData: Partial<XyoApiConfig> = {}): XyoArchivistApi => {
  return new XyoArchivistApi(getApiConfig(configData))
}

export const getRandomArchiveName = (): string => {
  const randomString = (Math.random() + 1).toString(36).substring(7).toLowerCase()
  return `test-archive-${randomString}`
}

export const getTokenForNewUser = async (api: XyoArchivistApi): Promise<string> => {
  const account = Account.random()
  const address = new Wallet(account.private.bytes)
  const challenge = await api.account(account.public).challenge.post()
  const message = assertEx(challenge?.state, 'Missing state from login challenge')
  const signature = await address.signMessage(message)
  const verify = await api.account(account.public).verify.post({ message, signature })
  const jwtToken = assertEx(verify?.token, 'Missing JWT token in response')
  return jwtToken
}

export const testSchemaPrefix = 'network.xyo.schema.test.'
export const getSchemaName = (): string => {
  return `${testSchemaPrefix}${uuid()}`
}

export const getTimestampMinutesFromNow = (minutes = 0) => {
  const t = new Date()
  t.setMinutes(t.getMinutes() + minutes)
  return +t
}
