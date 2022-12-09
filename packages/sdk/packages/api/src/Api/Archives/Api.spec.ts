import { getApi } from '../ApiUtil.spec'

describe('XyoArchivistArchivesApi', () => {
  describe('get', function () {
    it('gets an array of archives owned', async () => {
      const api = getApi()
      const response = await api.archives.get()
      expect(response).toBeArray()
      expect(response?.length).toBeGreaterThan(0)
    })
  })
})
