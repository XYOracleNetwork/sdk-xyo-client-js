import { XyoApiError } from '@xyo-network/api-models'

import { getApi, getRandomArchiveName } from '../ApiUtil.spec'

describe('XyoArchivistArchiveApi', () => {
  const api = getApi()
  describe('get', function () {
    let archive = ''
    beforeEach(() => {
      archive = getRandomArchiveName()
    })
    describe('get', function () {
      it('gets the archive', async () => {
        try {
          await api.archives.archive(archive).get()
          const response = await api.archives.archive(archive).get()
          expect(response?.archive).toBe(archive)
        } catch (ex) {
          const error = ex as XyoApiError
          expect(error === undefined)
        }
      })
    })
    describe('put', function () {
      it('creates the archive', async () => {
        try {
          const response = await api.archives.archive(archive).put()
          expect(response?.archive).toEqual(archive)
        } catch (ex) {
          const error = ex as XyoApiError
          expect(error === undefined)
        }
      })
    })
  })
})
