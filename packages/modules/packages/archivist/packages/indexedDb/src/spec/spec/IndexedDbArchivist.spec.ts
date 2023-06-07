/**
 * @jest-environment jsdom
 */

import { indexedDB } from 'fake-indexeddb'
import { createStore, UseStore } from 'idb-keyval'

import { IndexedDbArchivist, IndexedDbArchivistConfigSchema } from '../../packages/indexedDb/src/IndexedDbArchivist'
import { testArchivistAll, testArchivistRoundTrip } from './testArchivist'

window.indexedDB = indexedDB

describe('IndexedDbArchivist', () => {
  describe('Using injected IndexedDB instance', () => {
    const store: UseStore = createStore('foo', 'bar')
    const name = 'IndexedDB (injected)'
    testArchivistRoundTrip(
      IndexedDbArchivist.create({ config: { namespace: 'test', schema: IndexedDbArchivistConfigSchema }, indexedDB: store }),
      name,
    )
    testArchivistAll(IndexedDbArchivist.create({ config: { namespace: 'test', schema: IndexedDbArchivistConfigSchema }, indexedDB: store }), name)
  })
  describe('Using IndexedDB from window', () => {
    const name = 'IndexedDB (window)'
    testArchivistRoundTrip(IndexedDbArchivist.create({ config: { namespace: 'test', schema: IndexedDbArchivistConfigSchema } }), name)
    testArchivistAll(IndexedDbArchivist.create({ config: { namespace: 'test', schema: IndexedDbArchivistConfigSchema } }), name)
  })
})
