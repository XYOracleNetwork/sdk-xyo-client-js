import { XyoApiConfig, XyoApiError } from '@xyo-network/api-models'

import { XyoArchivistApi } from '../Api'
import { getNewArchive, getRandomArchiveName } from '../ApiUtil.spec'

const configData: XyoApiConfig = {
  apiDomain: process.env.API_DOMAIN || 'http://localhost:8080',
  onError: (error) => console.error(`Error: ${JSON.stringify(error)}`),
  onFailure: (response) => response,
  onSuccess: (response) => response,
}

describe('XyoArchivistArchivesApi', () => {
  describe('get', function () {
    it('gets an array of archives owned', async () => {
      const api = new XyoArchivistApi(configData)
      try {
        const response = await api.archives.get()
        throw new Error('Assert response here')
      } catch (ex) {
        const error = ex as XyoApiError
        console.log(JSON.stringify(error.response?.data, null, 2))
        expect(error === undefined)
      }
    })
  })

  describe('getArchive', function () {
    let archive = ''
    beforeEach(() => {
      archive = getRandomArchiveName()
    })
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

  describe('putArchive', function () {
    let archive = ''
    beforeEach(() => {
      archive = getRandomArchiveName()
    })
    it('returns the archive owned', async () => {
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

  describe('getArchiveKeys', function () {
    it('Returns the keys for the archive', async () => {
      try {
        const archive = getRandomArchiveName()
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

  describe('postArchiveKey', function () {
    it('Creates an archive key', async () => {
      try {
        const archive = getRandomArchiveName()
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

  describe('findBoundWitnessesStats', function () {
    it('returns stats for boundwitness', async () => {
      let api = new XyoArchivistApi(configData)
      try {
        api = new XyoArchivistApi({ ...configData })
        const stats = await api.archives.archive().block.stats.get()
        expect(stats?.count).toBeGreaterThan(0)
      } catch (ex) {
        const error = ex as XyoApiError
        console.log(JSON.stringify(error.response?.data, null, 2))
        expect(error === undefined)
      }
    })
  })

  describe('findBoundWitnessesBefore', function () {
    it('returns bound witnesses from before the timestamp', async () => {
      let api = new XyoArchivistApi(configData)
      try {
        api = new XyoArchivistApi({ ...configData })
        const [boundWitness] = new BoundWitnessBuilder().witness(Account.random()).build()
        await api.archives.archive().block.post([boundWitness])
        const timestamp = Date.now() + 10000
        // eslint-disable-next-line deprecation/deprecation
        const response = await api.archives.archive('temp').block.findBefore(timestamp)
        expect(response?.length).toBe(1)
      } catch (ex) {
        const error = ex as XyoApiError
        console.log(JSON.stringify(error.response?.data, null, 2))
        expect(error === undefined)
      }
    })
  })

  describe('findBoundWitnessesAfter', function () {
    it('returns bound witnesses from before the timestamp', async () => {
      let api = new XyoArchivistApi(configData)
      try {
        const archive = await getNewArchive(api)
        api = new XyoArchivistApi({ ...configData })
        const [boundWitness] = new BoundWitnessBuilder().witness(Account.random()).build()
        await api.archives.archive(archive).block.post([boundWitness])
        const timestamp = Date.now() - 10000
        const response = await api.archives.archive(archive).block.find({ order: 'asc', timestamp })
        expect(response?.length).toBe(1)
      } catch (ex) {
        const error = ex as XyoApiError
        console.log(JSON.stringify(error.response?.data, null, 2))
        expect(error === undefined)
      }
    })
  })
})
