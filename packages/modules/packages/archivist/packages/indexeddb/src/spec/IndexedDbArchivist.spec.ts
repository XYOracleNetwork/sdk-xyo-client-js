/**
 * @jest-environment jsdom
 */

import { indexedDB } from 'fake-indexeddb'

import { IndexedDbArchivist, IndexedDbArchivistConfigSchema } from '../IndexedDbArchivist'
import { testArchivistAll, testArchivistRoundTrip } from './testArchivist'

window.indexedDB = indexedDB

describe('IndexedDbArchivist', () => {
  describe('With dbName', () => {
    it('supplied via config uses config value', async () => {
      const dbName = 'testDbName'
      const archivist = await IndexedDbArchivist.create({ config: { dbName, schema: IndexedDbArchivistConfigSchema } })
      expect(archivist.dbName).toBe(dbName)
    })
    it('not supplied via config uses module name', async () => {
      const name = 'testModuleName'
      const archivist = await IndexedDbArchivist.create({ config: { name, schema: IndexedDbArchivistConfigSchema } })
      expect(archivist.dbName).toBe(name)
    })
    it('not supplied via config or module name uses default value', async () => {
      const archivist = await IndexedDbArchivist.create({ config: { schema: IndexedDbArchivistConfigSchema } })
      expect(archivist.dbName).toBe(IndexedDbArchivist.defaultDbName)
    })
  })
  describe('With dbStore', () => {
    it('supplied via config uses config value', async () => {
      const storeName = 'testStoreName'
      const archivist = await IndexedDbArchivist.create({ config: { schema: IndexedDbArchivistConfigSchema, storeName } })
      expect(archivist.storeName).toBe(storeName)
    })
    it('not supplied via config uses default value', async () => {
      const archivist = await IndexedDbArchivist.create({ config: { schema: IndexedDbArchivistConfigSchema } })
      expect(archivist.storeName).toBe(IndexedDbArchivist.defaultStoreName)
    })
  })

  describe('Using IndexedDB from window', () => {
    const name = 'IndexedDB (window)'
    testArchivistRoundTrip(IndexedDbArchivist.create({ config: { schema: IndexedDbArchivistConfigSchema } }), name)
    testArchivistAll(IndexedDbArchivist.create({ config: { schema: IndexedDbArchivistConfigSchema } }), name)
  })
})
