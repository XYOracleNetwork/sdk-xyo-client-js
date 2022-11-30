import { XyoApiConfig, XyoApiError } from '@xyo-network/api-models'

import { XyoArchivistApi } from '../Api'
import { getRandomArchiveName } from '../ApiUtil.spec'

const configData: XyoApiConfig = {
  apiDomain: process.env.API_DOMAIN || 'http://localhost:8080',
  onError: (error) => console.error(`Error: ${JSON.stringify(error)}`),
  onFailure: (response) => response,
  onSuccess: (response) => response,
}

describe('XyoArchivistArchiveApi', () => {
  describe('get', function () {
    let archive = ''
    beforeEach(() => {
      archive = getRandomArchiveName()
    })
    describe('get', function () {
      it('gets the archive', async () => {
        const api = new XyoArchivistApi(configData)
        try {
          await api.archives.archive(archive).get()
          const response = await api.archives.archive(archive).get()
          expect(response?.archive).toBe(archive)
        } catch (ex) {
          const error = ex as XyoApiError
          console.log(JSON.stringify(error.response?.data, null, 2))
          expect(error === undefined)
        }
      })
    })
    describe('put', function () {
      it('creates the archive', async () => {
        const api = new XyoArchivistApi(configData)
        try {
          const response = await api.archives.archive(archive).put()
          expect(response?.archive).toEqual(archive)
        } catch (ex) {
          const error = ex as XyoApiError
          console.log(JSON.stringify(error.response?.data, null, 2))
          expect(error === undefined)
        }
      })
    })
  })
})
