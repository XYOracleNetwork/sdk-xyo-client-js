/* eslint-disable complexity */
/* eslint-disable max-statements */

import { tmpdir } from 'node:os'

import type { AnyObject, Hash } from '@xylabs/sdk-js'
import { delay, toSafeJsonString } from '@xylabs/sdk-js'
import { Account } from '@xyo-network/account'
import type { AccountInstance } from '@xyo-network/account-model'
import { generateArchivistNextTests } from '@xyo-network/archivist-acceptance-tests'
import type { ArchivistInstance } from '@xyo-network/archivist-model'
import { isArchivistInstance, isArchivistModule } from '@xyo-network/archivist-model'
import { IdSchema } from '@xyo-network/id-payload-plugin'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import {
  asSchema, type Payload, type WithStorageMeta,
} from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { v4 } from 'uuid'
import {
  beforeAll, describe, expect, it,
} from 'vitest'

import { LevelDbArchivist } from '../Archivist.ts'
import { LevelDbArchivistConfigSchema } from '../Config.ts'

/**
 * @group module
 * @group archivist
 */
describe('LevelDbArchivist [full]', () => {
  type TestPayload = Payload<{ salt: string; schema: string }>

  const fillDb = async (db: ArchivistInstance, count: number = 10): Promise<TestPayload[]> => {
    const sources = Array.from({ length: count }).map((_, i) => {
      return { salt: `${i}`, schema: IdSchema }
    })
    await db.insert(sources)
    return sources
  }

  const shuffleArray = <T>(original: Array<T>) => {
    const shuffled = [...original]
    for (let i = shuffled.length - 1; i > 0; i--) {
      // Generate a random index between 0 and i
      const j = Math.floor(Math.random() * (i + 1))
      // Swap elements at indices i and j
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }
  let account: AccountInstance
  beforeAll(async () => {
    account = await Account.random()
  })
  describe('config', () => {
    describe('dbName', () => {
      it('supplied via config uses config value', async () => {
        const dbName = 'testDbName'
        const archivist = await LevelDbArchivist.create({
          account,
          config: {
            dbName, schema: LevelDbArchivistConfigSchema, storeName: 'payloads', location: tmpdir(), clearStoreOnStart: true,
          },
        })
        expect(archivist.dbName).toBe(dbName)
      })
    })
    describe('dbStore', () => {
      it('supplied via config uses config value', async () => {
        const dbName = 'testDbName'
        const storeName = 'testStoreName'
        const archivist = await LevelDbArchivist.create({
          account,
          config: {
            dbName, schema: LevelDbArchivistConfigSchema, storeName, location: tmpdir(), clearStoreOnStart: true,
          },
        })
        expect(archivist.storeName).toBe(storeName)
      })
      it('allows for multiple dbStores within the same dbName', async () => {
        const dbName = 'testDbName'
        const storeName1 = 'testStoreName1'
        const storeName2 = 'testStoreName2'
        const archivist1 = await LevelDbArchivist.create({
          account,
          config: {
            dbName, schema: LevelDbArchivistConfigSchema, storeName: storeName1, location: tmpdir(), clearStoreOnStart: true,
          },
        })
        const archivist2 = await LevelDbArchivist.create({
          account,
          config: {
            dbName, schema: LevelDbArchivistConfigSchema, storeName: storeName2, location: tmpdir(), clearStoreOnStart: true,
          },
        })

        expect(isArchivistInstance(archivist1)).toBeTruthy()
        expect(isArchivistModule(archivist1)).toBeTruthy()

        // TODO: This test is not testing the end state of indexedDB, but rather the
        // state of the Archivist instance and therefore isn't valid.  We'd want to actually
        // open indexedDB and check the state of the stores matches what we want (which it doesn't).
        expect(archivist1.storeName).toBe(storeName1)
        expect(archivist2.storeName).toBe(storeName2)
      })
    })
  })
  describe('all', () => {
    const dbName = 'e926a178-9c6a-4604-b65c-d1fccd97f1de'
    const storeName = '27fcea19-c30f-415a-a7f9-0b0514705cb1'
    let sources: Payload[] = []
    let archivistModule: ArchivistInstance
    beforeAll(async () => {
      archivistModule = await LevelDbArchivist.create({
        account,
        config: {
          dbName, schema: LevelDbArchivistConfigSchema, storeName, location: tmpdir(), clearStoreOnStart: true,
        },
      })
      sources = await fillDb(archivistModule)
    })
    it('returns all data', async () => {
      const getResult = await archivistModule.next?.({ limit: Number.MAX_SAFE_INTEGER })
      expect(getResult).toBeDefined()
      expect(getResult?.length).toBe(sources.length)
      expect(PayloadBuilder.omitStorageMeta(getResult)).toEqual(sources)
    })
  })

  describe('delete', () => {
    const dbName = '6e3fcd65-f24f-4ebc-b314-f597b385fb8e'
    const storeName = 'c0872f52-32b9-415e-8ca9-af78713cee28'
    let sources: Payload[] = []
    let archivistModule: ArchivistInstance
    beforeAll(async () => {
      archivistModule = await LevelDbArchivist.create({
        account,
        config: {
          dbName, schema: LevelDbArchivistConfigSchema, storeName, location: tmpdir(), clearStoreOnStart: true,
        },
      })
      sources = await fillDb(archivistModule)
    })
    it('deletes data', async () => {
      const getResult = (await archivistModule.next({ limit: 200 })) ?? []
      expect(getResult).toBeDefined()
      expect(getResult?.length).toBe(sources.length)
      const dataHashes = (await PayloadBuilder.dataHashes(getResult)) ?? []
      const deleteResult = await archivistModule.delete?.(dataHashes)
      expect(deleteResult.length).toBe(dataHashes.length)
      expect((await archivistModule.next({ limit: 200 })).length).toBe(0)
    })
  })
  describe('get', () => {
    const dbName = 'b4379714-73d1-42c6-88e7-1a363b7ed86f'
    const storeName = '3dbdb153-79d0-45d0-b2f7-9f06cdd74b1e'
    let sources: TestPayload[] = []
    let archivistModule: ArchivistInstance
    beforeAll(async () => {
      archivistModule = await LevelDbArchivist.create({
        account,
        config: {
          dbName, schema: LevelDbArchivistConfigSchema, storeName, location: tmpdir(), clearStoreOnStart: true,
        },
      })
      sources = await fillDb(archivistModule)
    })
    it('gets existing data', async () => {
      for (const source of sources) {
        const sourceHash = await PayloadBuilder.dataHash(source)
        const getResult = await archivistModule.get([sourceHash])
        expect(getResult).toBeDefined()
        expect(getResult.length).toBe(1)
        const resultHash = await PayloadWrapper.wrap(getResult[0]).dataHash()
        expect(resultHash).toBe(sourceHash)
      }
    })
    it('returned by order of insertion', async () => {
      const shuffled = shuffleArray(sources)
      const sourceHashes = await Promise.all(shuffled.map(source => PayloadBuilder.dataHash(source)))
      const getResult = (await archivistModule.get(sourceHashes)) as WithStorageMeta<TestPayload>[]
      expect(getResult).toBeDefined()
      expect(getResult.length).toBe(sourceHashes.length)
      const salts = sources.map(source => source.salt)
      const resultSalts = getResult.map(result => result?.salt)
      expect(resultSalts).toEqual(salts)
    })
    it('returns nothing for non-existing hashes', async () => {
      const hashThatDoesNotExist = '0000000000000000000000000000000000000000000000000000000000000000' as Hash
      const getResult = await archivistModule.get([hashThatDoesNotExist])
      expect(getResult).toBeDefined()
      expect(getResult.length).toBe(0)
    })
    describe('by hash', () => {
      let payload1: Payload<AnyObject>
      let payload2: Payload<AnyObject>
      let dataHash1: Hash
      let dataHash2: Hash
      let rootHash1: Hash
      let rootHash2: Hash
      beforeAll(async () => {
        const salt = '650123f6-191e-4cc4-a813-f7a29dcbfb0e'
        payload1 = {
          $some: [
            '12bed6aa884f5b7ffc08e19790b5db0da724b8b7471138dcbec090a0798861db0da8255f0d9297ba981b2cbbea65d9eadabac6632124f10f22c709d333a1f285',
          ],
          salt,
          schema: IdSchema,
        }
        payload2 = {
          $some: [
            '22bed6aa884f5b7ffc08e19790b5db0da724b8b7471138dcbec090a0798861db0da8255f0d9297ba981b2cbbea65d9eadabac6632124f10f22c709d333a1f285',
          ],
          salt,
          schema: IdSchema,
        }
        dataHash1 = await PayloadBuilder.dataHash(payload1)
        dataHash2 = await PayloadBuilder.dataHash(payload2)
        rootHash1 = await PayloadBuilder.hash(payload1)
        rootHash2 = await PayloadBuilder.hash(payload2)
        expect(dataHash1).toBe(dataHash2)
        expect(rootHash1).not.toBe(rootHash2)
        await archivistModule.insert([payload1])
        await archivistModule.insert([payload2])
      })
      describe('data hash', () => {
        it('returns value using hash', async () => {
          const result = await archivistModule.get([dataHash1])
          expect(result).toBeDefined()
          expect(result.length).toBe(1)
        })
        it('deduplicates multiple hashes', async () => {
          const result = await archivistModule.get([dataHash1, dataHash2])
          expect(result).toBeDefined()
          expect(result.length).toBe(1)
        })
        it('returns the first occurrence of the hash', async () => {
          // Same data hash contained by multiple root hashes
          const result = await archivistModule.get([dataHash2])
          expect(result).toBeDefined()
          expect(result.length).toBe(1)
          // Returns the first occurrence of the data hash
          // expect(PayloadBuilder.omitStorageMeta(result[0])).toEqual(payload1)
        })
      })
      describe('root hash', () => {
        it('returns value using hash', async () => {
          const result = await archivistModule.get([rootHash1])
          expect(result).toBeDefined()
          expect(result.length).toBe(1)
        })
        it('deduplicates multiple hashes', async () => {
          const result = await archivistModule.get([rootHash1, rootHash1])
          expect(result).toBeDefined()
          expect(result.length).toBe(1)
        })
      })
    })
  })
  describe('insert', () => {
    describe('with unique data', () => {
      const dbName = 'bd86d2dd-dc48-4621-8c1f-105ba2e90287'
      const storeName = 'f8d14049-2966-4198-a2ab-1c096a949315'
      let sources: Payload[] = []
      let archivistModule: ArchivistInstance
      beforeAll(async () => {
        archivistModule = await LevelDbArchivist.create({
          account,
          config: {
            dbName, schema: LevelDbArchivistConfigSchema, storeName, location: tmpdir(), clearStoreOnStart: true,
          },
        })
        sources = await fillDb(archivistModule)
      })
      it('can round trip data using data hash', async () => {
        await Promise.all(
          sources.map(async (source) => {
            const sourceHash = await PayloadBuilder.dataHash(source)
            const getResult = await archivistModule.get([sourceHash])
            expect(getResult).toBeDefined()
            expect(getResult.length).toBe(1)
            const [result] = getResult
            expect(PayloadBuilder.omitStorageMeta(result)).toEqual(PayloadBuilder.omitStorageMeta(source))
            const resultHash = await PayloadBuilder.dataHash(result)
            expect(resultHash).toBe(sourceHash)
          }),
        )
      })
      it('can round trip data using root hash', async () => {
        await Promise.all(
          sources.map(async (source) => {
            const sourceHash = await PayloadBuilder.hash(source)
            const getResult = await archivistModule.get([sourceHash])
            expect(getResult).toBeDefined()
            expect(getResult.length).toBe(1)
            const [result] = getResult
            expect(PayloadBuilder.omitStorageMeta(result)).toEqual(PayloadBuilder.omitStorageMeta(source))
            const resultHash = await PayloadBuilder.hash(result)
            expect(resultHash).toBe(sourceHash)
          }),
        )
      })
    })
    describe('with duplicate data', () => {
      const dbName = 'bb43b6fe-2f9e-4bda-8177-f94336353f98'
      const storeName = '91c6b87d-3ac8-4cfd-8aee-d509f3de0299'
      let archivistModule: ArchivistInstance
      beforeAll(async () => {
        archivistModule = await LevelDbArchivist.create({
          account,
          config: {
            dbName, schema: LevelDbArchivistConfigSchema, storeName, location: tmpdir(), clearStoreOnStart: true,
          },
        })
      })
      it('handles duplicate insertions', async () => {
        // Insert same payload twice
        const source = { salt: '2d515e1d-d82c-4545-9903-3eded7fefa7c', schema: IdSchema }
        // First insertion should succeed and return the inserted payload
        expect((await archivistModule.insert([source]))[0]._hash).toEqual(await PayloadBuilder.hash(source))
        // Second insertion should succeed but return empty array since no new data was inserted
        expect(await archivistModule.insert([source])).toEqual([])
        // Ensure we can get the inserted payload
        const sourceHash = await PayloadBuilder.dataHash(source)
        const getResult = await archivistModule.get([sourceHash])
        expect(getResult).toBeDefined()
        expect(getResult.length).toBe(1)
        const resultHash = await PayloadBuilder.dataHash(getResult[0])
        expect(resultHash).toBe(sourceHash)
        // Ensure the DB has only one instance of the payload written to it
        const allResult = await archivistModule.next({ limit: 200 })
        expect(allResult).toBeDefined()
        expect(allResult.length).toBe(1)
      })
    })
  })

  describe('next', () => {
    const dbName = 'bd86d2dd-dc48-4621-8c1f-105ba2e90288'
    const storeName = 'f8d14049-2966-4198-a2ab-1c096a949316'
    it('next', async () => {
      const archivist = await LevelDbArchivist.create({
        account: 'random',
        config: {
          dbName, schema: LevelDbArchivistConfigSchema, storeName, location: tmpdir(), clearStoreOnStart: true,
        },
      })
      const account = await Account.random()

      const payloads1 = [
        { schema: asSchema('network.xyo.test', true), value: 1 },
      ]

      const payloads2 = [
        { schema: asSchema('network.xyo.test', true), value: 2 },
      ]

      const payloads3 = [
        { schema: asSchema('network.xyo.test', true), value: 3 },
      ]

      const payloads4 = [
        { schema: asSchema('network.xyo.test', true), value: 4 },
      ]

      await archivist.insert(payloads1)
      await delay(1)
      console.log(toSafeJsonString(payloads1, 10))
      const [bw, payloads, errors] = await archivist.insertQuery(payloads2, account)
      await delay(1)
      await archivist.insert(payloads3)
      await delay(1)
      await archivist.insert(payloads4)
      await delay(1)
      expect(bw).toBeDefined()
      expect(payloads).toBeDefined()
      expect(errors).toBeDefined()

      const batch1 = await archivist.next?.({ limit: 2 })
      expect(batch1.length).toBe(2)
      expect(await PayloadBuilder.dataHash(batch1?.[0])).toEqual(await PayloadBuilder.dataHash(payloads1[0]))

      const batch2 = await archivist.next?.({ limit: 2, cursor: batch1?.[1]._sequence })
      expect(batch2.length).toBe(2)
      expect(await PayloadBuilder.dataHash(batch2?.[1])).toEqual(await PayloadBuilder.dataHash(payloads4[0]))

      const batch3 = await archivist.next?.({ limit: 20 })
      expect(batch3.length).toBe(4)
      expect(await PayloadBuilder.dataHash(batch3?.[0])).toEqual(await PayloadBuilder.dataHash(payloads1[0]))

      const batch4 = await archivist.next?.({ limit: 20, cursor: batch1?.[0]._sequence })
      expect(batch4.length).toBe(3)
      expect(await PayloadBuilder.dataHash(batch4?.[0])).toEqual(await PayloadBuilder.dataHash(payloads2[0]))

      // desc
      const batch1Desc = await archivist.next?.({ limit: 2, order: 'desc' })
      expect(batch1Desc.length).toBe(2)
      expect(await PayloadBuilder.dataHash(batch1Desc?.[0])).toEqual(await PayloadBuilder.dataHash(payloads4[0]))

      const batch2Desc = await archivist.next?.({
        limit: 2, cursor: batch1Desc?.[1]._sequence, order: 'desc',
      })
      expect(batch2Desc.length).toBe(2)
      expect(await PayloadBuilder.dataHash(batch2Desc?.[1])).toEqual(await PayloadBuilder.dataHash(payloads1[0]))

      const batch3Desc = await archivist.next?.({
        limit: 20, cursor: batch1Desc?.[1]._sequence, order: 'desc',
      })
      expect(batch3Desc.length).toBe(2)
      expect(await PayloadBuilder.dataHash(batch3Desc?.[1])).toEqual(await PayloadBuilder.dataHash(payloads1[0]))
    })
  })
  generateArchivistNextTests(async () => {
    const dbName = v4()
    const storeName = v4()
    const location = tmpdir()
    const clearStoreOnStart = true
    const schema = LevelDbArchivistConfigSchema
    return await LevelDbArchivist.create({
      account: 'random',
      config: {
        dbName, schema, storeName, location, clearStoreOnStart,
      },
    })
  })
})
