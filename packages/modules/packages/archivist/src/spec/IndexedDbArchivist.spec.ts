/**
 * @jest-environment jsdom
 */

import { indexedDB } from 'fake-indexeddb'

import { IndexedDbArchivist, IndexedDbArchivistConfigSchema } from '../IndexedDbArchivist'
import { testArchivistAll, testArchivistRoundTrip } from './testArchivist'

const name = 'IndexedDB'

window.indexedDB = indexedDB

testArchivistRoundTrip(IndexedDbArchivist.create({ config: { namespace: 'test', schema: IndexedDbArchivistConfigSchema } }), name)
testArchivistAll(IndexedDbArchivist.create({ config: { namespace: 'test', schema: IndexedDbArchivistConfigSchema } }), name)
