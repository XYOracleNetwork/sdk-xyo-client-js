import { XyoApiError } from '@xyo-network/api-models'

import { getApi, getRandomArchiveName } from '../../../ApiUtil.spec'

describe('XyoArchivistArchiveSettingsKeyApi', () => {
  let archive = ''
  beforeEach(() => {
    archive = getRandomArchiveName()
  })
  describe('get', function () {
    it('Returns the keys for the archive', async () => {
      try {
        const api = getApi()
        const archiveApi = api.archives.archive(archive)
        await archiveApi.put()
        const key = await archiveApi.settings.key.post()
        const response = await archiveApi.settings.key.get()
        expect(response?.length).toEqual(1)
        expect(response?.[0]).toEqual(key)
      } catch (ex) {
        const error = ex as XyoApiError
        console.log(JSON.stringify(error.response?.data, null, 2))
        expect(error === undefined)
      }
    })
  })

  describe('post', function () {
    it('Creates an archive key', async () => {
      try {
        const api = getApi()
        const archiveApi = api.archives.archive(archive)
        await archiveApi.put()
        const response = await archiveApi.settings.key.post()
        expect(response?.keys.length).toBe(1)
      } catch (ex) {
        const error = ex as XyoApiError
        console.log(JSON.stringify(error.response?.data, null, 2))
        expect(error === undefined)
      }
    })
  })
})
