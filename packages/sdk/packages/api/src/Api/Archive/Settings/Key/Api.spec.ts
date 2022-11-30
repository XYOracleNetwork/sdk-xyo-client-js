import { assertEx } from '@xylabs/assert'

import { XyoArchiveKey } from '../../../../models'
import { XyoArchivistApi } from '../../../Api'
import { getApi, getRandomArchiveName, getTokenForNewUser } from '../../../ApiUtil.spec'

describe('XyoArchivistArchiveSettingsKeyApi', () => {
  let api: XyoArchivistApi
  let archive = ''
  beforeEach(async () => {
    archive = getRandomArchiveName()
    api = getApi()
    const token = await getTokenForNewUser(api)
    api.config.jwtToken = token
    await api.archives.archive(archive).put()
  })
  describe('post', () => {
    it('Creates an archive key', async () => {
      const response = await api.archives.archive(archive).settings.key.post()
      expect(response).toBeObject()
    })
  })
  describe('get', () => {
    let key: XyoArchiveKey
    beforeEach(async () => {
      const response = await api.archives.archive(archive).settings.key.post()
      key = response as unknown as XyoArchiveKey
    })
    it('Returns the keys for the archive', async () => {
      const response = await api.archives.archive(archive).settings.key.get()
      expect(response).toBeArrayOfSize(1)
      expect(response).toContainEqual(key)
    })
  })
})
