import { XyoAccount } from '@xyo-network/account'
import { XyoBoundWitness, XyoBoundWitnessBuilder } from '@xyo-network/boundwitness'

import { XyoApiConfig, XyoApiError } from '../models'
import { testPayload } from '../Test'
import { XyoArchivistApi } from './Api'
import { getNewArchive, getRandomArchiveName } from './ApiUtil.spec'

const configData: XyoApiConfig = {
  apiDomain: process.env.API_DOMAIN || 'https://beta.api.archivist.xyo.network',
  onError: (error) => console.error(`Error: ${JSON.stringify(error)}`),
  onFailure: (response) => response, //console.error(`Failure: ${response.statusText} [${response.status}] [${JSON.stringify(response.data)}]`),
  onSuccess: (response) => response, //console.log(`Success: ${response.statusText} [${response.status}] [${JSON.stringify(response.data)}]`),
}

describe('postBoundWitness', () => {
  it.each([true, false])('posts a single bound witness', async (inlinePayloads) => {
    const builder = new XyoBoundWitnessBuilder({ inlinePayloads }).witness(XyoAccount.random()).payload(testPayload)
    const api = new XyoArchivistApi(configData)
    const boundWitness: XyoBoundWitness = builder.build()
    try {
      const response = await api.archives.archive().block.post([boundWitness])

      expect(response?.length).toEqual(1)
    } catch (ex) {
      const error = ex as XyoApiError
      console.log(JSON.stringify(error.response?.data, null, 2))
      throw ex
    }
  })
})

describe('postBoundWitnesses', () => {
  it.each([true, false])('posts multiple bound witnesses', async (inlinePayloads) => {
    const builder = new XyoBoundWitnessBuilder({ inlinePayloads }).witness(XyoAccount.random()).payload(testPayload)
    const api = new XyoArchivistApi(configData)
    const json = builder.build()
    const boundWitnesses: XyoBoundWitness[] = [json, json]

    //TODO: We are casting the result here since the server has not yet been updated to return the actual saved data

    try {
      const response = await api.archives.archive().block.post(boundWitnesses)
      expect(response?.length).toEqual(2)
    } catch (ex) {
      const error = ex as XyoApiError
      console.log(JSON.stringify(error, null, 2))
      throw ex
    }
  })
})

describe.skip('XyoArchivistApi', () => {
  describe('get', () => {
    it('returns a new XyoArchivistApi', () => {
      const api = new XyoArchivistApi(configData)
      expect(api).toBeDefined()
    })
  })

  describe('getArchives', function () {
    let archive = ''
    beforeEach(() => {
      archive = getRandomArchiveName()
    })
    it('gets an array of archives owned', async () => {
      const api = new XyoArchivistApi(configData)
      try {
        await api.archives.archive(archive).put()
        const archives = await api.archives.get()
        expect(Array.isArray(archives)).toBe(true)
        const archiveNames = archives?.map((x) => x.archive)
        expect(archiveNames).toContain(archive)
      } catch (ex) {
        const error = ex as XyoApiError
        console.log(JSON.stringify(error.response?.data, null, 2))
        throw ex
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
        throw ex
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
        throw ex
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
        throw ex
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
        throw ex
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
        throw ex
      }
    })
  })

  describe('findBoundWitnessesBefore', function () {
    it('returns bound witnesses from before the timestamp', async () => {
      let api = new XyoArchivistApi(configData)
      try {
        api = new XyoArchivistApi({ ...configData })
        const boundWitness = new XyoBoundWitnessBuilder().witness(XyoAccount.random()).build()
        await api.archives.archive().block.post([boundWitness])
        const timestamp = Date.now() + 10000
        // eslint-disable-next-line deprecation/deprecation
        const response = await api.archives.archive('temp').block.findBefore(timestamp)
        expect(response?.length).toBe(1)
        const actual = response?.[0]
        expect(actual?._timestamp).toBeTruthy()
        expect(actual?._timestamp).toBeLessThan(timestamp)
      } catch (ex) {
        const error = ex as XyoApiError
        console.log(JSON.stringify(error.response?.data, null, 2))
        throw ex
      }
    })
  })

  describe('findBoundWitnessesAfter', function () {
    it('returns bound witnesses from before the timestamp', async () => {
      let api = new XyoArchivistApi(configData)
      try {
        const archive = await getNewArchive(api)
        api = new XyoArchivistApi({ ...configData })
        const boundWitness = new XyoBoundWitnessBuilder().witness(XyoAccount.random()).build()
        await api.archives.archive(archive).block.post([boundWitness])
        const timestamp = Date.now() - 10000
        const response = await api.archives.archive(archive).block.find({ order: 'asc', timestamp })
        expect(response?.length).toBe(1)
        const actual = response?.[0]
        expect(actual?._timestamp).toBeTruthy()
        expect(actual?._timestamp).toBeGreaterThan(timestamp)
      } catch (ex) {
        const error = ex as XyoApiError
        console.log(JSON.stringify(error.response?.data, null, 2))
        throw ex
      }
    })
  })
})
