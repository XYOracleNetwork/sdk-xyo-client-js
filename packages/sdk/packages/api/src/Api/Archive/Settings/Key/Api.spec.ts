import { XyoApiConfig, XyoApiError } from '@xyo-network/api-models'

import { XyoArchivistApi } from '../../../Api'
import { getRandomArchiveName } from '../../../ApiUtil.spec'

const configData: XyoApiConfig = {
  apiDomain: process.env.API_DOMAIN || 'http://localhost:8080',
  onError: (error) => console.error(`Error: ${JSON.stringify(error)}`),
  onFailure: (response) => response,
  onSuccess: (response) => response,
}

describe('XyoArchivistArchiveSettingsKeyApi', () => {
  let archive = ''
  beforeEach(() => {
    archive = getRandomArchiveName()
  })
  describe('get', function () {
    it('Returns the keys for the archive', async () => {
      try {
        const api = new XyoArchivistApi({ ...configData })
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
        const api = new XyoArchivistApi({ ...configData })
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
