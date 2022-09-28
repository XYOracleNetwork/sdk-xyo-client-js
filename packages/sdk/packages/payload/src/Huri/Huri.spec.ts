import { delay } from '@xylabs/delay'

import { XyoPayload } from '../models'
import { Huri } from './Huri'

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

describe('Huri', () => {
  describe('Valid Items', () => {
    valid.map((item) => {
      test(`valid [${item}]`, () => {
        try {
          const huri = new Huri(item)
          expect(huri.hash).toBe(hash)
        } catch (ex) {
          console.error(`Valid Huri failed: [${item}]`)
          console.error(ex)
        }
      })
    })
  })
  describe('Valid Items w/archive', () => {
    validWithTempArchive.map((item) => {
      test(`valid w/archive [${item}]`, () => {
        try {
          const huri = new Huri(item)
          expect(huri.hash).toBe(hash)
          expect(huri.archive).toBe('temp')
        } catch (ex) {
          console.error(`Valid Huri w/archive failed: [${item}]`)
          console.error(ex)
        }
      })
    })
  })
  describe('Invalid Items', () => {
    invalid.map((item) => {
      test(`invalid [${item}]`, () => {
        expect(() => new Huri(item)).toThrowError()
      })
    })
  })
  describe('Api Fetch', () => {
    it('Valid Huri', async () => {
      const huri = new Huri('https://beta.api.archivist.xyo.network/18f97b3e85f5bede65e7c0a85d74aee896de58ead8bc4b1b3d7300646c653057')
      const result = await huri.fetch()
      expect(result?.schema).toBe('network.xyo.schema')
    })
    it('Invalid Huri', async () => {
      const huri = new Huri('https://beta.api.archivist.xyo.network/18f97b3e85f5bede65e7c0a85d74aee896de58ead8bc4b1b3d7300646c653bad')
      await expect(huri.fetch()).rejects.toThrow()
    })
  })
  describe('Fetch Override', () => {
    invalid.map((item) => {
      test(`invalid [${item}]`, async () => {
        const oldFetch = Huri.fetch
        Huri.fetch = async <T extends XyoPayload = XyoPayload>(huri: Huri): Promise<T | undefined> => {
          await delay(0)
          const payload: T = {
            schema: huri.hash,
          } as T
          return payload
        }
        const huri = new Huri('https://beta.api.archivist.xyo.network/18f97b3e85f5bede65e7c0a85d74aee896de58ead8bc4b1b3d7300646c653057')
        const result = await huri.fetch()
        Huri.fetch = oldFetch
        expect(result?.schema).toBe('18f97b3e85f5bede65e7c0a85d74aee896de58ead8bc4b1b3d7300646c653057')
      })
    })
  })
})
