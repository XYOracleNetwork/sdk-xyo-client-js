import { Wallet } from '@ethersproject/wallet'
import { assertEx } from '@xylabs/sdk-js'
import { XyoAccount } from '@xyo-network/account'
import { v4 } from 'uuid'

import { XyoArchivistApi } from './Api'

test('Must have tests defined', () => {
  expect(true).toBeTruthy()
})

export const getRandomArchiveName = (): string => {
  const randomString = (Math.random() + 1).toString(36).substring(7).toLowerCase()
  return `test-archive-${randomString}`
}

export const getTokenForNewUser = async (api: XyoArchivistApi): Promise<string> => {
  const account = XyoAccount.random()
  const address = new Wallet(account.private.bytes)
  const challenge = await api.account(account.public).challenge.post()
  const message = assertEx(challenge?.state, 'Missing state from login challenge')
  const signature = await address.signMessage(message)
  const verify = await api.account(account.public).verify.post({ message, signature })
  const jwtToken = assertEx(verify?.token, 'Missing JWT token in response')
  return jwtToken
}

export const getNewArchive = async (api: XyoArchivistApi) => {
  const jwtToken = await getTokenForNewUser(api)
  const authenticatedApi = new XyoArchivistApi({ ...api.config, jwtToken })
  const name = getRandomArchiveName()
  const response = await authenticatedApi.archives.archive(name).put()
  const archive = assertEx(response?.archive, 'Missing archive in response')
  return archive
}

export const testSchemaPrefix = 'network.xyo.schema.test.'
export const getSchemaName = (): string => {
  return `${testSchemaPrefix}${v4()}`
}

export const getTimestampMinutesFromNow = (minutes = 0) => {
  const t = new Date()
  t.setMinutes(t.getMinutes() + minutes)
  return +t
}
