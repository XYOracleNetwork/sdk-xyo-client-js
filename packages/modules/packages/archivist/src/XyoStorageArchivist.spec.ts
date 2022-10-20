/**
 * @jest-environment jsdom
 */

import { PayloadWrapper } from '@xyo-network/payload'

import { testArchivistAll, testArchivistRoundTrip } from './test.spec.test'
import { XyoMemoryArchivist } from './XyoMemoryArchivist'
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

test('XyoArchivist Parent Write Through', async () => {
  const memory = new XyoMemoryArchivist()

  const resolver = (address: string) => {
    return address === memory.address ? memory : null
  }

  const storage = new XyoStorageArchivist(
    { namespace: 'test', parents: { write: [memory.address] }, persistAccount: true, type: 'local' },
    undefined,
    resolver,
  )

  const wrapper = new PayloadWrapper({ schema: 'network.xyo.test' })

  await storage.insert([wrapper.payload])

  expect((await storage.get([wrapper.hash])).length).toBe(1)
  expect((await memory.get([wrapper.hash])).length).toBe(1)
})
