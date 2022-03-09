import { AxiosError } from 'axios'

import { XyoAddress } from '../Address'
import { XyoBoundWitnessBuilder } from '../BoundWitness'
import { XyoBoundWitness } from '../models'
import { testPayload } from '../Test'
import { XyoArchivistApi } from './Api'
import { XyoArchivistApiConfig } from './Config'

const config: XyoArchivistApiConfig = {
  apiDomain: process.env.API_DOMAIN || 'https://beta.api.archivist.xyo.network',
  apiKey: process.env.API_KEY || undefined,
  archive: 'temp',
  jwtToken: process.env.JWT_TOKEN || undefined,
}

const describeSkipIfNoToken = config.jwtToken || config.apiKey ? describe : describe.skip

const getRandomArchiveName = (): string => {
  const randomString = (Math.random() + 1).toString(36).substring(7)
  return `test-archive-${randomString}`
}

const getNewArchive = async (api: XyoArchivistApi) => {
  const archive = getRandomArchiveName()
  const response = await api.archive.put(archive)
  return response.archive
}

describe('getDomain', function () {
  it('gets the domain config', async () => {
    const api = new XyoArchivistApi(config)
    try {
      const response = await api.domain.getConfig('network.xyo')
      expect(response.schema?.length).toBeGreaterThanOrEqual(2)
    } catch (ex) {
      const error = ex as AxiosError
      console.log(JSON.stringify(error.response?.data, null, 2))
      throw ex
    }
  })
})

describeSkipIfNoToken('XyoArchivistApi', () => {
  describe('get', () => {
    it('returns a new XyoArchivistApi', () => {
      const api = new XyoArchivistApi(config)
      expect(api).toBeDefined()
    })
  })

  describe('getArchives', function () {
    let archive = ''
    beforeEach(() => {
      archive = getRandomArchiveName()
    })
    it('gets an array of archives owned', async () => {
      const api = new XyoArchivistApi(config)
      try {
        await api.archive.put(archive)
        const archives = await api.archive.get()
        expect(Array.isArray(archives)).toBe(true)
        const archiveNames = archives.map((x) => x.archive)
        expect(archiveNames).toContain(archive)
      } catch (ex) {
        const error = ex as AxiosError
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
      const api = new XyoArchivistApi(config)
      try {
        await api.archive.get(archive)
        const response = (await api.archive.get(archive)).pop()
        expect(response?.archive).toBe(archive)
      } catch (ex) {
        const error = ex as AxiosError
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
      const api = new XyoArchivistApi(config)
      try {
        const response = await api.archive.put(archive)
        expect(response.archive).toEqual(archive)
      } catch (ex) {
        const error = ex as AxiosError
        console.log(JSON.stringify(error.response?.data, null, 2))
        throw ex
      }
    })
  })

  describe('getArchiveKeys', function () {
    it('Returns the keys for the archive', async () => {
      try {
        const archive = getRandomArchiveName()
        const api = new XyoArchivistApi({ ...config, archive })
        await api.archive.put(archive)
        const key = await api.archive.settings.postArchiveKey()
        const response = await api.archive.settings.getArchiveKeys()
        expect(response.length).toEqual(1)
        expect(response[0]).toEqual(key)
      } catch (ex) {
        const error = ex as AxiosError
        console.log(JSON.stringify(error.response?.data, null, 2))
        throw ex
      }
    })
  })

  describe('postArchiveKey', function () {
    it('Creates an archive key', async () => {
      try {
        const archive = getRandomArchiveName()
        const api = new XyoArchivistApi({ ...config, archive })
        await api.archive.put(archive)
        const response = await api.archive.settings.postArchiveKey()
        expect(response.key).toBeTruthy()
      } catch (ex) {
        const error = ex as AxiosError
        console.log(JSON.stringify(error.response?.data, null, 2))
        throw ex
      }
    })
  })

  describe('postBoundWitness', () => {
    it.each([true, false])('posts a single bound witness', async (inlinePayloads) => {
      const builder = new XyoBoundWitnessBuilder({ inlinePayloads }).witness(XyoAddress.random()).payload(testPayload)
      const api = new XyoArchivistApi(config)
      const boundWitness: XyoBoundWitness = builder.build()

      try {
        const response = await api.archive.postBoundWitness(boundWitness)
        expect(response.boundWitnesses).toEqual(1)
        if (inlinePayloads) {
          expect(response.payloads).toEqual(1)
        } else {
          expect(response.payloads).toEqual(0)
        }
      } catch (ex) {
        const error = ex as AxiosError
        console.log(JSON.stringify(error.response?.data, null, 2))
        throw ex
      }
    })
  })
  describe('postBoundWitnesses', () => {
    it.each([true, false])('posts multiple bound witnesses', async (inlinePayloads) => {
      const builder = new XyoBoundWitnessBuilder({ inlinePayloads }).witness(XyoAddress.random()).payload(testPayload)
      const api = new XyoArchivistApi(config)
      const json = builder.build()
      const boundWitnesses: XyoBoundWitness[] = [json, json]
      try {
        const response = await api.archive.postBoundWitnesses(boundWitnesses)
        expect(response.boundWitnesses).toEqual(2)
        if (inlinePayloads) {
          expect(response.payloads).toEqual(2)
        } else {
          expect(response.payloads).toEqual(0)
        }
      } catch (ex) {
        const error = ex as AxiosError
        console.log(JSON.stringify(error.response?.data, null, 2))
        throw ex
      }
    })
  })
  describe('getBoundWitnessesBefore', function () {
    it('returns bound witnesses from before the timestamp', async () => {
      let api = new XyoArchivistApi(config)
      try {
        const archive = await getNewArchive(api)
        api = new XyoArchivistApi({ ...config, archive })
        const boundWitness = new XyoBoundWitnessBuilder().witness(XyoAddress.random()).build()
        await api.archive.postBoundWitness(boundWitness)
        const timestamp = Date.now() + 10000
        const response = await api.archive.getBoundWitnessesBefore(timestamp)
        expect(response.length).toBe(1)
        const actual = response[0]
        expect(actual._timestamp).toBeTruthy()
        expect(actual._timestamp).toBeLessThan(timestamp)
      } catch (ex) {
        const error = ex as AxiosError
        console.log(JSON.stringify(error.response?.data, null, 2))
        throw ex
      }
    })
  })
  describe('getBoundWitnessesAfter', function () {
    it('returns bound witnesses from before the timestamp', async () => {
      let api = new XyoArchivistApi(config)
      try {
        const archive = await getNewArchive(api)
        api = new XyoArchivistApi({ ...config, archive })
        const boundWitness = new XyoBoundWitnessBuilder().witness(XyoAddress.random()).build()
        await api.archive.postBoundWitness(boundWitness)
        const timestamp = Date.now() - 10000
        const response = await api.archive.getBoundWitnessesAfter(timestamp)
        expect(response.length).toBe(1)
        const actual = response[0]
        expect(actual._timestamp).toBeTruthy()
        expect(actual._timestamp).toBeGreaterThan(timestamp)
      } catch (ex) {
        const error = ex as AxiosError
        console.log(JSON.stringify(error.response?.data, null, 2))
        throw ex
      }
    })
  })
})
