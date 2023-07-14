/**
 * @jest-environment jsdom
 */
// Augments window with necessary prototypes to ensure instance of comparisons work
// eslint-disable-next-line import/no-internal-modules
import 'fake-indexeddb/auto'

import { Account } from '@xyo-network/account'
import { IDBFactory } from 'fake-indexeddb'

import { IndexedDbArchivistSimple, IndexedDbArchivistSimpleConfigSchema } from '../IndexedDbArchivistSimple'

// Shim via fake-indexeddb
const freshInstance = new IDBFactory()
window.indexedDB = freshInstance

describe('IndexedDbArchivistSimple', () => {
  const account = Account.randomSync()
  describe('With dbName', () => {
    it('supplied via config uses config value', async () => {
      const dbName = 'testDbName'
      const archivist = await IndexedDbArchivistSimple.create({ account, config: { dbName, schema: IndexedDbArchivistSimpleConfigSchema } })
      expect(archivist.dbName).toBe(dbName)
    })
    it('not supplied via config uses module name', async () => {
      const name = 'testModuleName'
      const archivist = await IndexedDbArchivistSimple.create({ account, config: { name, schema: IndexedDbArchivistSimpleConfigSchema } })
      expect(archivist.dbName).toBe(name)
    })
    it('not supplied via config or module name uses default value', async () => {
      const archivist = await IndexedDbArchivistSimple.create({ account, config: { schema: IndexedDbArchivistSimpleConfigSchema } })
      expect(archivist.dbName).toBe(IndexedDbArchivistSimple.defaultDbName)
    })
  })
  describe('With dbStore', () => {
    it('supplied via config uses config value', async () => {
      const storeName = 'testStoreName'
      const archivist = await IndexedDbArchivistSimple.create({ account, config: { schema: IndexedDbArchivistSimpleConfigSchema, storeName } })
      expect(archivist.storeName).toBe(storeName)
    })
    it('not supplied via config uses default value', async () => {
      const archivist = await IndexedDbArchivistSimple.create({ account, config: { schema: IndexedDbArchivistSimpleConfigSchema } })
      expect(archivist.storeName).toBe(IndexedDbArchivistSimple.defaultStoreName)
    })
  })
})
