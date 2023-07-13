/**
 * @jest-environment jsdom
 */

import { Account } from '@xyo-network/account'
import { asArchivistInstance } from '@xyo-network/archivist-model'
import { QueryBoundWitnessWrapper } from '@xyo-network/boundwitness-builder'
import { MemoryArchivist } from '@xyo-network/memory-archivist'
import { ModuleQuery } from '@xyo-network/module'
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

test('Archivist Private Key Save', async () => {
  const account = Account.randomSync()
  const storage = await StorageArchivist.create({
    account,
    config: { namespace: 'test', persistAccount: true, schema: StorageArchivistConfigSchema, type: 'local' },
  })
  const address = storage.address
  const storage2 = await StorageArchivist.create({
    account,
    config: { namespace: 'test', persistAccount: true, schema: StorageArchivistConfigSchema, type: 'local' },
  })
  expect(storage2.address).toBe(address)
})

test('Archivist passed account', async () => {
  const account = await Account.create({ phrase: 'temp' })

  const storage = (await StorageArchivist.create({
    account,
    config: { namespace: 'main', persistAccount: true, schema: StorageArchivistConfigSchema, type: 'local' },
  })) as StorageArchivist

  expect(storage['account'].address).toBe(account.address)
})

test('Archivist Parent Reads', async () => {
  const parent = await MemoryArchivist.create()
  const memoryNode = await MemoryNode.create()

  await memoryNode.register(parent)
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
  await memoryNode.register(storage)
  await memoryNode.attach(storage.address, true)

  const wrapper = PayloadWrapper.wrap({ schema: 'network.xyo.test' })

  expect(wrapper).toBeDefined()

  const inserted = await parent.insert([wrapper.payload()])

  expect(inserted).toBeArrayOfSize(1)

  const fromStorage = await storage.get([await wrapper.hashAsync()])

  expect(fromStorage).toBeArrayOfSize(1)
})
