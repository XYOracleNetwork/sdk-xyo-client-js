import { defaultPublicArchives } from '@xyo-network/node-core-model'

import { claimArchive, getArchives, getTokenForNewUser } from '../../../testUtil'

describe('/archive', () => {
  describe('when authorized returns', () => {
    let token = ''
    beforeEach(async () => {
      token = await getTokenForNewUser()
    })
    it('the users archives and the default public archives', async () => {
      const claimArchiveResponse = await claimArchive(token)
      const response = await getArchives(token)
      expect(response.length).toBeGreaterThan(0)
      const actual = response.map((a) => a.archive).sort()
      const expected = [claimArchiveResponse, ...defaultPublicArchives].map((a) => a.archive).sort()
      expect(actual).toEqual(expected)
    })
    it('just the default public archives if the user owns no archives', async () => {
      const response = await getArchives(token)
      expect(response.length).toBeGreaterThan(0)
      expect(response).toEqual(defaultPublicArchives)
    })
  })
  describe('when unauthorized returns', () => {
    it('the default public archives', async () => {
      const response = await getArchives()
      expect(response.length).toBeGreaterThan(0)
      expect(response).toEqual(defaultPublicArchives)
    })
  })
})
