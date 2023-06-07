/**
 * @jest-environment jsdom
 */

import { indexedDB } from 'fake-indexeddb'
import { createStore, UseStore } from 'idb-keyval'

import { IndexedDbArchivist, IndexedDbArchivistConfigSchema } from '../IndexedDbArchivist'
import { testArchivistAll, testArchivistRoundTrip } from './testArchivist'

window.indexedDB = indexedDB

describe('IndexedDbArchivist', () => {
  describe('Using injected IndexedDB instance', () => {
    const store: UseStore = createStore('foo', 'bar')
    testArchivistRoundTrip(
      IndexedDbArchivist.create({ config: { namespace: 'test', schema: IndexedDbArchivistConfigSchema }, indexedDB: store }),
      'IndexedDB (injected)',
    )
    testArchivistAll(
      IndexedDbArchivist.create({ config: { namespace: 'test', schema: IndexedDbArchivistConfigSchema }, indexedDB: store }),
      'IndexedDB (injected)',
    )
  })
  describe('Using IndexedDB from window', () => {
    testArchivistRoundTrip(IndexedDbArchivist.create({ config: { namespace: 'test', schema: IndexedDbArchivistConfigSchema } }), 'IndexedDB (window)')
    testArchivistAll(IndexedDbArchivist.create({ config: { namespace: 'test', schema: IndexedDbArchivistConfigSchema } }), 'IndexedDB (window)')
  })
})
