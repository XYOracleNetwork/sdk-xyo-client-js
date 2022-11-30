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
        await api.archives.archive(archive).get()
        const response = await api.archives.archive(archive).get()
        expect(response?.archive).toBe(archive)
      })
    })
    describe('put', function () {
      it('creates the archive', async () => {
        const response = await api.archives.archive(archive).put()
        expect(response?.archive).toEqual(archive)
      })
    })
  })
})
