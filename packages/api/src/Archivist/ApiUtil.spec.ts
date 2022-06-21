import { XyoAccount } from '@xyo-network/core'
import { Wallet } from '@ethersproject/wallet'
import { v4 } from 'uuid'

import { XyoArchivistApi } from './Api'

test('Must have tests defined', () => {
  expect(true).toBeTruthy()
})

export const getRandomArchiveName = (): string => {
  const randomString = (Math.random() + 1).toString(36).substring(7).toLowerCase()
  return `test-archive-${randomString}`
}

export const getNewArchive = async (api: XyoArchivistApi) => {
  const account = XyoAccount.random()
  const address = new Wallet(account.private.bytes)
  const challenge = await api.account(account.public).challenge.post()
  expect(challenge?.state).toBeTruthy()
  const message = challenge?.state || ''
  const signature = await address.signMessage(message)
  const verify = await api.account(account.public).verify.post({ message, signature })
  expect(verify?.token).toBeTruthy()
  const jwtToken = verify?.token || ''
  const authenticatedApi = new XyoArchivistApi({ ...api.config, jwtToken })
  const name = getRandomArchiveName()
  const response = await authenticatedApi.archives.archive(name).put()
  const archive = response?.archive
  expect(archive).toBeTruthy()
  return archive || ''
}

export const testSchemaPrefix = 'network.xyo.schema.test.'
export const getSchemaName = (): string => {
  return `${testSchemaPrefix}${v4()}`
}
