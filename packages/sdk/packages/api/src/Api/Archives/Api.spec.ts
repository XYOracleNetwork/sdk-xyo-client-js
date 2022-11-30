import { getApi } from '../ApiUtil.spec'

describe('XyoArchivistArchivesApi', () => {
  describe('get', function () {
    it('gets an array of archives owned', async () => {
      const api = getApi()
      const response = await api.archives.get()
      throw new Error('Assert response here')
    })
  })
})
