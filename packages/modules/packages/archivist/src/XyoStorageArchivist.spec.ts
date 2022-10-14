/**
 * @jest-environment jsdom
 */

import { XyoModuleResolver } from '@xyo-network/module'
import { PayloadWrapper } from '@xyo-network/payload'

import { testArchivistAll, testArchivistRoundTrip } from './test.spec.test'
import { XyoMemoryArchivist } from './XyoMemoryArchivist'
import { XyoStorageArchivist, XyoStorageArchivistConfigSchema } from './XyoStorageArchivist'

testArchivistRoundTrip(
  new XyoStorageArchivist({ config: { namespace: 'test', schema: XyoStorageArchivistConfigSchema, type: 'local' } }).start(),
  'local',
)
testArchivistRoundTrip(
  new XyoStorageArchivist({ config: { namespace: 'test', schema: XyoStorageArchivistConfigSchema, type: 'session' } }).start(),
  'session',
)
testArchivistRoundTrip(
  new XyoStorageArchivist({ config: { namespace: 'test', schema: XyoStorageArchivistConfigSchema, type: 'page' } }).start(),
  'page',
)

testArchivistAll(new XyoStorageArchivist({ config: { namespace: 'test', schema: XyoStorageArchivistConfigSchema, type: 'local' } }).start(), 'local')
testArchivistAll(
  new XyoStorageArchivist({ config: { namespace: 'test', schema: XyoStorageArchivistConfigSchema, type: 'session' } }).start(),
  'session',
)
testArchivistAll(new XyoStorageArchivist({ config: { namespace: 'test', schema: XyoStorageArchivistConfigSchema, type: 'page' } }).start(), 'page')

test('XyoArchivist Private Key Save', async () => {
  const storage = new XyoStorageArchivist({
    config: { namespace: 'test', persistAccount: true, schema: XyoStorageArchivistConfigSchema, type: 'local' },
    logger: console,
  })
  await storage.start()
  const address = storage.address
  const storage2 = new XyoStorageArchivist({
    config: { namespace: 'test', persistAccount: true, schema: XyoStorageArchivistConfigSchema, type: 'local' },
    logger: console,
  })
  await storage2.start()
  expect(storage2.address).toBe(address)
})

test('XyoArchivist Parent Write Through', async () => {
  const memory = new XyoMemoryArchivist()

  const storage = new XyoStorageArchivist({
    config: { namespace: 'test', parents: { write: [memory.address] }, persistAccount: true, schema: XyoStorageArchivistConfigSchema, type: 'local' },
    logger: console,
    resolver: new XyoModuleResolver().add(memory),
  })
  await storage.start()

  const wrapper = new PayloadWrapper({ schema: 'network.xyo.test' })

  await storage.insert([wrapper.payload])

  expect((await storage.get([wrapper.hash])).length).toBe(1)
  expect((await memory.get([wrapper.hash])).length).toBe(1)
})
