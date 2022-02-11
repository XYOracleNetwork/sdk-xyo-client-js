import { AxiosError } from 'axios'

import { XyoAddress } from '../Address'
import { XyoBoundWitnessBuilder } from '../BoundWitness'
import { XyoBoundWitness } from '../models'
import { testPayload } from '../Test'
import { XyoArchivistApi } from './ArchivistApi'
import { XyoArchivistApiConfig } from './ArchivistApiConfig'

const timeout = 20000
const config: XyoArchivistApiConfig = {
  apiDomain: process.env.API_DOMAIN || 'https://api.archivist.xyo.network',
  apiKey: process.env.API_KEY || undefined,
  archive: 'test',
  jwtToken: process.env.JWT_TOKEN || undefined,
  token: process.env.TOKEN || undefined,
}

const describeSkipIfNoToken = config.token ? describe : describe.skip

const getRandomArchiveName = (): string => {
  const randomString = (Math.random() + 1).toString(36).substring(7)
  return `test-archive-${randomString}`
}

describe('XyoArchivistApi', () => {
  describe('get', () => {
    it('returns a new XyoArchivistApi', () => {
      const api = XyoArchivistApi.get(config)
      expect(api).toBeDefined()
    })
    describe('with token', () => {
      it('is authenticated', () => {
        const testConfig: XyoArchivistApiConfig = { ...config, token: 'foo' }
        const api = XyoArchivistApi.get(testConfig)
        expect(api.authenticated).toEqual(true)
      })
    })
    describe('with no token', () => {
      it('is not authenticated', () => {
        const testConfig: XyoArchivistApiConfig = { ...config, token: undefined }
        const api = XyoArchivistApi.get(testConfig)
        expect(api.authenticated).toEqual(false)
      })
    })
  })

  describeSkipIfNoToken('getArchives', function () {
    let archive = ''
    beforeEach(() => {
      archive = getRandomArchiveName()
    })
    it(
      'gets an array of archives owned',
      async () => {
        const api = XyoArchivistApi.get(config)
        try {
          await api.putArchive(archive)
          const archives = await api.getArchives()
          expect(Array.isArray(archives)).toBe(true)
          expect(archives).toContain(archive)
        } catch (ex) {
          const error = ex as AxiosError
          console.log(JSON.stringify(error.response?.data, null, 2))
          throw ex
        }
      },
      timeout
    )
  })

  describeSkipIfNoToken('putArchive', function () {
    let archive = ''
    beforeEach(() => {
      archive = getRandomArchiveName()
    })
    it(
      'returns the archive owned',
      async () => {
        const api = XyoArchivistApi.get(config)
        try {
          const response = await api.putArchive(archive)
          expect(response.archive).toEqual(archive)
        } catch (ex) {
          const error = ex as AxiosError
          console.log(JSON.stringify(error.response?.data, null, 2))
          throw ex
        }
      },
      timeout
    )
    it(
      'adds the archive to the list of archives owned by the user',
      async () => {
        const api = XyoArchivistApi.get(config)
        try {
          await api.putArchive(archive)
          const archives = await api.getArchives()
          expect(archives).toContain(archive)
        } catch (ex) {
          const error = ex as AxiosError
          console.log(JSON.stringify(error.response?.data, null, 2))
          throw ex
        }
      },
      timeout
    )
  })

  describeSkipIfNoToken('getArchiveKeys', function () {
    it(
      'Returns the keys for the archive',
      async () => {
        try {
          const archive = getRandomArchiveName()
          const api = XyoArchivistApi.get({ ...config, archive })
          await api.putArchive(archive)
          const key = await api.postArchiveKey()
          const response = await api.getArchiveKeys()
          expect(response.length).toEqual(1)
          expect(response[0]).toEqual(key)
        } catch (ex) {
          const error = ex as AxiosError
          console.log(JSON.stringify(error.response?.data, null, 2))
          throw ex
        }
      },
      timeout
    )
  })

  describeSkipIfNoToken('postArchiveKey', function () {
    it(
      'Creates an archive key',
      async () => {
        try {
          const archive = getRandomArchiveName()
          const api = XyoArchivistApi.get({ ...config, archive })
          await api.putArchive(archive)
          const response = await api.postArchiveKey()
          expect(response.key).toBeTruthy()
        } catch (ex) {
          const error = ex as AxiosError
          console.log(JSON.stringify(error.response?.data, null, 2))
          throw ex
        }
      },
      timeout
    )
  })

  describe('postBoundWitness', () => {
    it.each([true, false])(
      'posts a single bound witness',
      async (inlinePayloads) => {
        const builder = new XyoBoundWitnessBuilder({ inlinePayloads }).witness(XyoAddress.random()).payload(testPayload)
        const api = XyoArchivistApi.get(config)
        const boundWitness: XyoBoundWitness = builder.build()

        try {
          const response = await api.postBoundWitness(boundWitness)
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
      },
      timeout
    )
  })
  describe('postBoundWitnesses', () => {
    it.each([true, false])(
      'posts multiple bound witnesses',
      async (inlinePayloads) => {
        const builder = new XyoBoundWitnessBuilder({ inlinePayloads }).witness(XyoAddress.random()).payload(testPayload)
        const api = XyoArchivistApi.get(config)
        const json = builder.build()
        const boundWitnesses: XyoBoundWitness[] = [json, json]
        try {
          const response = await api.postBoundWitnesses(boundWitnesses)
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
      },
      timeout
    )
  })
})
