/**
 * @jest-environment jsdom
 */

import { delay } from '@xylabs/delay'
import { Account } from '@xyo-network/account'
import { IdSchema } from '@xyo-network/id-payload-plugin'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { indexedDB } from 'fake-indexeddb'

import { IndexedDbArchivist, IndexedDbArchivistConfigSchema } from '../IndexedDbArchivist'

window.indexedDB = indexedDB

/**
 * @group module
 * @group archivist
 */

describe('IndexedDbArchivist', () => {
  describe('With dbName', () => {
    it('supplied via config uses config value', async () => {
      const dbName = 'testDbName'
      const archivist = await IndexedDbArchivist.create({
        account: Account.randomSync(),
        config: { dbName, schema: IndexedDbArchivistConfigSchema },
      })
      expect(archivist.dbName).toBe(dbName)
    })
    it('not supplied via config uses module name', async () => {
      const name = 'testModuleName'
      const archivist = await IndexedDbArchivist.create({
        account: Account.randomSync(),
        config: { name, schema: IndexedDbArchivistConfigSchema },
      })
      expect(archivist.dbName).toBe(name)
    })
    it('not supplied via config or module name uses default value', async () => {
      const archivist = await IndexedDbArchivist.create({ account: Account.randomSync(), config: { schema: IndexedDbArchivistConfigSchema } })
      expect(archivist.dbName).toBe(IndexedDbArchivist.defaultDbName)
    })
  })
  describe('With dbStore', () => {
    it('supplied via config uses config value', async () => {
      const storeName = 'testStoreName'
      const archivist = await IndexedDbArchivist.create({
        account: Account.randomSync(),
        config: { schema: IndexedDbArchivistConfigSchema, storeName },
      })
      expect(archivist.storeName).toBe(storeName)
    })
    it('not supplied via config uses default value', async () => {
      const archivist = await IndexedDbArchivist.create({ account: Account.randomSync(), config: { schema: IndexedDbArchivistConfigSchema } })
      expect(archivist.storeName).toBe(IndexedDbArchivist.defaultStoreName)
    })
  })

  describe('Using IndexedDB from window', () => {
    test('Archivist RoundTrip [IndexedDB (window)]', async () => {
      const idPayload: Payload<{ salt: string }> = {
        salt: Date.now().toString(),
        schema: IdSchema,
      }
      const payloadWrapper = PayloadWrapper.wrap(idPayload)

      const archivistModule = await IndexedDbArchivist.create({
        account: Account.randomSync(),
        config: { schema: IndexedDbArchivistConfigSchema },
      })
      const insertResult = await archivistModule.insert([idPayload])
      expect(insertResult).toBeDefined()

      const getResult = await archivistModule.get([await payloadWrapper.hashAsync()])
      expect(getResult).toBeDefined()
      expect(getResult.length).toBe(1)
      const gottenPayload = getResult[0]
      if (gottenPayload) {
        const gottenPayloadWrapper = PayloadWrapper.wrap(gottenPayload)
        expect(await gottenPayloadWrapper.hashAsync()).toBe(await payloadWrapper.hashAsync())
      }
    })
    test('Archivist All [IndexedDB (window)]', async () => {
      const idPayload = {
        salt: Date.now().toString(),
        schema: IdSchema,
      }
      const archivistModule = await IndexedDbArchivist.create({
        account: Account.randomSync(),
        config: { schema: IndexedDbArchivistConfigSchema },
      })
      for (let x = 0; x < 10; x++) {
        await archivistModule.insert([idPayload])
        await delay(10)
      }
      const getResult = await archivistModule.all?.()
      expect(getResult).toBeDefined()
      expect(getResult?.length).toBe(2)
    })
  })
})
