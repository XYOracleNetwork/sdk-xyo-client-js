/**
 * @jest-environment jsdom
 */

import { testArchivistAll, testArchivistRoundTrip } from './test'
import { XyoStorageArchivist } from './XyoStorageArchivist'

testArchivistRoundTrip(new XyoStorageArchivist({ namespace: 'test', type: 'local' }), 'local')
testArchivistRoundTrip(new XyoStorageArchivist({ namespace: 'test', type: 'session' }), 'session')
testArchivistRoundTrip(new XyoStorageArchivist({ namespace: 'test', type: 'page' }), 'page')

testArchivistAll(new XyoStorageArchivist({ namespace: 'test', type: 'local' }), 'local')
testArchivistAll(new XyoStorageArchivist({ namespace: 'test', type: 'session' }), 'session')
testArchivistAll(new XyoStorageArchivist({ namespace: 'test', type: 'page' }), 'page')
