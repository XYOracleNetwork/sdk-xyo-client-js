/**
 * @jest-environment jsdom
 */

import { XyoModuleResolver } from '@xyo-network/module'
import { PayloadWrapper } from '@xyo-network/payload'

import { testArchivistAll, testArchivistRoundTrip } from './test.spec.test'
import { XyoMemoryArchivist } from './XyoMemoryArchivist'
import { XyoStorageArchivist, XyoStorageArchivistConfigSchema } from './XyoStorageArchivist'

testArchivistRoundTrip(new XyoStorageArchivist({ config: { namespace: 'test', schema: XyoStorageArchivistConfigSchema, type: 'local' } }), 'local')
testArchivistRoundTrip(
  new XyoStorageArchivist({ config: { namespace: 'test', schema: XyoStorageArchivistConfigSchema, type: 'session' } }),
  'session',
)
testArchivistRoundTrip(new XyoStorageArchivist({ config: { namespace: 'test', schema: XyoStorageArchivistConfigSchema, type: 'page' } }), 'page')

testArchivistAll(new XyoStorageArchivist({ config: { namespace: 'test', schema: XyoStorageArchivistConfigSchema, type: 'local' } }), 'local')
testArchivistAll(new XyoStorageArchivist({ config: { namespace: 'test', schema: XyoStorageArchivistConfigSchema, type: 'session' } }), 'session')
testArchivistAll(new XyoStorageArchivist({ config: { namespace: 'test', schema: XyoStorageArchivistConfigSchema, type: 'page' } }), 'page')

test('XyoArchivist Private Key Save', () => {
  const storage = new XyoStorageArchivist({
    config: { namespace: 'test', persistAccount: true, schema: XyoStorageArchivistConfigSchema, type: 'local' },
    logger: console,
  })
  const address = storage.address
  const storage2 = new XyoStorageArchivist({
    config: { namespace: 'test', persistAccount: true, schema: XyoStorageArchivistConfigSchema, type: 'local' },
    logger: console,
  })
  expect(storage2.address).toBe(address)
})

test('XyoArchivist Parent Write Through', async () => {
  const memory = new XyoMemoryArchivist()

  const storage = new XyoStorageArchivist({
    config: { namespace: 'test', parents: { write: [memory.address] }, persistAccount: true, schema: XyoStorageArchivistConfigSchema, type: 'local' },
    logger: console,
    resolver: new XyoModuleResolver().add(memory),
  })

  const wrapper = new PayloadWrapper({ schema: 'network.xyo.test' })

  await storage.insert([wrapper.payload])

  expect((await storage.get([wrapper.hash])).length).toBe(1)
  expect((await memory.get([wrapper.hash])).length).toBe(1)
})
