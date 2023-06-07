/**
 * @jest-environment jsdom
 */

import { indexedDB } from 'fake-indexeddb'

import { IndexedDbArchivist, IndexedDbArchivistConfigSchema } from '../IndexedDbArchivist'
import { testArchivistAll, testArchivistRoundTrip } from './testArchivist'

window.indexedDB = indexedDB

testArchivistRoundTrip(IndexedDbArchivist.create({ config: { namespace: 'test', schema: IndexedDbArchivistConfigSchema } }), 'cookie')
testArchivistAll(IndexedDbArchivist.create({ config: { namespace: 'test', schema: IndexedDbArchivistConfigSchema } }), 'cookie')
