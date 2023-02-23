import { getApi } from '../ApiUtil.spec'

describe('XyoArchivistApi', () => {
  describe('get', () => {
    it('returns Node Discover', async () => {
      const api = getApi()
      expect(api).toBeDefined()
      const response = await api.get()
      expect(response).toBeArray()
      expect(response?.address).toBeString()
      expect(response?.queries).toBeArray()
      expect(response?.queries?.length).toBeGreaterThan(0)
      expect(response?.children).toBeArray()
      expect(response?.children?.length).toBeGreaterThan(0)
    })
  })
})
