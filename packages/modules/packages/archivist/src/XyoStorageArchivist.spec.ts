/**
 * @jest-environment jsdom
 */

import { testArchivistAll, testArchivistRoundTrip } from './test.spec.test'
import { XyoStorageArchivist } from './XyoStorageArchivist'

testArchivistRoundTrip(new XyoStorageArchivist({ namespace: 'test', type: 'local' }), 'local')
testArchivistRoundTrip(new XyoStorageArchivist({ namespace: 'test', type: 'session' }), 'session')
testArchivistRoundTrip(new XyoStorageArchivist({ namespace: 'test', type: 'page' }), 'page')

testArchivistAll(new XyoStorageArchivist({ namespace: 'test', type: 'local' }), 'local')
testArchivistAll(new XyoStorageArchivist({ namespace: 'test', type: 'session' }), 'session')
testArchivistAll(new XyoStorageArchivist({ namespace: 'test', type: 'page' }), 'page')

test('XyoArchivist Private Key Save', () => {
  const storage = new XyoStorageArchivist({ namespace: 'test', persistAccount: true, type: 'local' })
  const address = storage.address
  const storage2 = new XyoStorageArchivist({ namespace: 'test', persistAccount: true, type: 'local' })
  expect(storage2.address).toBe(address)
})
