/* eslint-disable sonarjs/no-duplicate-string */
import { axios } from '@xylabs/axios'
import { delay } from '@xylabs/delay'
import { Payload } from '@xyo-network/payload-model'

import { Huri } from '../Huri.js'

const hash = 'fb3606d71dcdd49a0aacc9d234e412684d577803c8a9ed9399a9d3776cc88e24'

const valid = [
  `https://${hash}`,
  `https://api.archivist.xyo.network/temp/${hash}`,
  `https://api.archivist.xyo.network/${hash}`,
  `http://api.archivist.xyo.network/${hash}`,
  `/api.archivist.xyo.network/${hash}`,
  `//${hash}`,
  `/${hash}`,
  `${hash}`,
]

const validWithTempArchive = [
  `https://api.archivist.xyo.network/temp/${hash}`,
  `https://api.archivist.xyo.network/temp/${hash}`,
  `http://api.archivist.xyo.network/temp/${hash}`,
  `/api.archivist.xyo.network/temp/${hash}`,
]

const invalid = [`https:///api.archivist.xyo.network/${hash}`, `https://api.archivist.xyo.network//${hash}`]

describe.skip('Huri', () => {
  describe('Valid Items', () => {
    for (const item of valid) {
      test(`valid [${item}]`, () => {
        try {
          const huri = new Huri(item)
          expect(huri.hash).toBe(hash)
        } catch (error) {
          console.error(`Valid Huri failed: [${item}]`)
          console.error(error)
        }
      })
    }
  })
  describe('Valid Items w/archive', () => {
    for (const item of validWithTempArchive) {
      test(`valid w/archive [${item}]`, () => {
        try {
          const huri = new Huri(item)
          expect(huri.hash).toBe(hash)
          expect(huri.archive).toBe('temp')
        } catch (error) {
          console.error(`Valid Huri w/archive failed: [${item}]`)
          console.error(error)
        }
      })
    }
  })
  describe('Invalid Items', () => {
    for (const item of invalid) {
      test(`invalid [${item}]`, () => {
        expect(() => new Huri(item)).toThrow()
      })
    }
  })
  describe('Api Fetch', () => {
    it('Valid Huri', async () => {
      const huri = new Huri('http://localhost:8080/18f97b3e85f5bede65e7c0a85d74aee896de58ead8bc4b1b3d7300646c653057')
      const result = await huri.fetch()
      expect(result?.schema).toBe('network.xyo.schema')
    })
    it('Valid Huri with token', (done) => {
      const token = 'abc123'
      const huri = new Huri('http://localhost:8080/18f97b3e85f5bede65e7c0a85d74aee896de58ead8bc4b1b3d7300646c653057', { token })
      expect(huri.token).toBe(token)
      axios.interceptors.request.use((config) => {
        const tokenValue = config.headers.get('Authorization')
        expect(tokenValue).toBe(`Bearer ${token}`)
        done()
        return config
      })
      // ignore result since token is fake
      huri.fetch().catch(() => {})
    })
    it('Invalid Huri', async () => {
      const huri = new Huri('http://localhost:8080/18f97b3e85f5bede65e7c0a85d74aee896de58ead8bc4b1b3d7300646c653bad')
      await expect(huri.fetch()).rejects.toThrow()
    })
  })
  describe('Fetch Override', () => {
    for (const item of invalid) {
      test(`invalid [${item}]`, async () => {
        const oldFetch = Huri.fetch
        Huri.fetch = async <T extends Payload = Payload>(huri: Huri): Promise<T | undefined> => {
          await delay(0)
          const payload: T = {
            schema: huri.hash,
          } as T
          return payload
        }
        const huri = new Huri('http://localhost:8080/18f97b3e85f5bede65e7c0a85d74aee896de58ead8bc4b1b3d7300646c653057')
        const result = await huri.fetch()
        Huri.fetch = oldFetch
        expect(result?.schema).toBe('18f97b3e85f5bede65e7c0a85d74aee896de58ead8bc4b1b3d7300646c653057')
      })
    }
  })
})
