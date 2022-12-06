import { getApi, getRandomArchiveName, getTokenForNewUser } from '../ApiUtil.spec'

describe('XyoArchivistArchiveApi', () => {
  const api = getApi()
  const archive = getRandomArchiveName()
  beforeEach(async () => {
    const token = await getTokenForNewUser(api)
    api.config.jwtToken = token
  })
  describe('put', () => {
    it('creates the archive', async () => {
      const response = await api.archives.archive(archive).put()
      expect(response?.archive).toEqual(archive)
    })
  })
  describe('get', () => {
    it('gets the archive', async () => {
      const response = await api.archives.archive(archive).get()
      expect(response?.archive).toBe(archive)
    })
  })
})
