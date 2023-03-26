/**
 * @jest-environment jsdom
 */

import { Account } from '@xyo-network/account'
import { MemoryArchivist } from '@xyo-network/memory-archivist'
import { MemoryNode } from '@xyo-network/node'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { StorageArchivist, StorageArchivistConfigSchema } from '../StorageArchivist'
import { testArchivistAll, testArchivistRoundTrip } from './testArchivist'

testArchivistRoundTrip(StorageArchivist.create({ config: { namespace: 'test', schema: StorageArchivistConfigSchema, type: 'local' } }), 'local')
testArchivistRoundTrip(
  StorageArchivist.create({
    config: { namespace: 'test', schema: StorageArchivistConfigSchema, type: 'session' },
  }),
  'session',
)
testArchivistRoundTrip(
  StorageArchivist.create({
    config: { namespace: 'test', schema: StorageArchivistConfigSchema, type: 'page' },
  }),
  'page',
)

testArchivistAll(
  StorageArchivist.create({
    config: { namespace: 'test', schema: StorageArchivistConfigSchema, type: 'local' },
  }),
  'local',
)
testArchivistAll(
  StorageArchivist.create({
    config: { namespace: 'test', schema: StorageArchivistConfigSchema, type: 'session' },
  }),
  'session',
)
testArchivistAll(
  StorageArchivist.create({
    config: { namespace: 'test', schema: StorageArchivistConfigSchema, type: 'page' },
  }),
  'page',
)

test('XyoArchivist Private Key Save', async () => {
  const storage = await StorageArchivist.create({
    config: { namespace: 'test', persistAccount: true, schema: StorageArchivistConfigSchema, type: 'local' },
  })
  const address = storage.address
  const storage2 = await StorageArchivist.create({
    config: { namespace: 'test', persistAccount: true, schema: StorageArchivistConfigSchema, type: 'local' },
  })
  expect(storage2.address).toBe(address)
})

test('XyoArchivist passed account', async () => {
  const account = new Account({ phrase: 'temp' })

  const storage = (await StorageArchivist.create({
    account,
    config: { namespace: 'main', persistAccount: true, schema: StorageArchivistConfigSchema, type: 'local' },
  })) as StorageArchivist

  expect(storage['account'].addressValue.hex).toBe(account.addressValue.hex)
})

test('XyoArchivist Parent Write Through', async () => {
  const node = await MemoryNode.create()
  const memory = await MemoryArchivist.create()

  const storage = (await StorageArchivist.create({
    config: {
      namespace: 'test',
      parents: { write: [memory.address] },
      persistAccount: true,
      schema: StorageArchivistConfigSchema,
      type: 'local',
    },
  })) as StorageArchivist
  await node.register(memory).attach(memory.address)
  await node.register(storage).attach(storage.address)

  const wrapper = new PayloadWrapper({ schema: 'network.xyo.test' })

  expect(wrapper).toBeDefined()

  storage.on('inserted', ({ boundWitnesses }) => {
    expect(boundWitnesses.length).toBeGreaterThan(0)
  })

  const inserted = await storage.insert([wrapper.payload])

  expect(inserted).toBeArrayOfSize(2)

  const fromStorage = await storage.get([wrapper.hash])
  const fromMemory = await memory.get([wrapper.hash])

  expect(fromStorage).toBeArrayOfSize(1)
  expect(fromMemory).toBeArrayOfSize(1)
})

test('XyoArchivist Parent Reads', async () => {
  const parent = await MemoryArchivist.create()
  const memoryNode = await MemoryNode.create()

  memoryNode.register(parent)
  await memoryNode.attach(parent.address, true)

  const storage = await StorageArchivist.create({
    config: {
      namespace: 'test',
      parents: { read: [parent.address] },
      persistAccount: true,
      schema: StorageArchivistConfigSchema,
      type: 'local',
    },
  })
  memoryNode.register(storage)
  await memoryNode.attach(storage.address, true)

  const wrapper = new PayloadWrapper({ schema: 'network.xyo.test' })

  expect(wrapper).toBeDefined()

  const inserted = await parent.insert([wrapper.payload])

  expect(inserted).toBeArrayOfSize(1)

  const fromStorage = await storage.get([wrapper.hash])

  expect(fromStorage).toBeArrayOfSize(1)
})
