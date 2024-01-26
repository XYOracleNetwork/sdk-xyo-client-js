import { Account } from '@xyo-network/account'
import { MemoryArchivist } from '@xyo-network/archivist-memory'
import { asArchivistInstance } from '@xyo-network/archivist-model'
import { QueryBoundWitnessWrapper } from '@xyo-network/boundwitness-builder'
import { ModuleQuery } from '@xyo-network/module-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { StorageArchivist, StorageArchivistConfigSchema } from '../StorageArchivist'

/**
 * @group module
 * @group archivist
 */

test('Archivist Parent Write Through', async () => {
  const node = await MemoryNode.create({ account: Account.randomSync() })
  const memory = await MemoryArchivist.create({ account: Account.randomSync() })

  const storage = (await StorageArchivist.create({
    account: Account.randomSync(),
    config: {
      namespace: 'test',
      parents: { write: [memory.address] },
      persistAccount: true,
      schema: StorageArchivistConfigSchema,
      type: 'local',
    },
  })) as StorageArchivist
  await node.register(memory)
  await node.attach(memory.address)
  await node.register(storage)
  await node.attach(storage.address)

  const wrapper = await PayloadWrapper.wrap({ schema: 'network.xyo.test' })

  expect(wrapper).toBeDefined()

  storage.on('inserted', ({ payloads }) => {
    expect(payloads.length).toBeGreaterThan(0)
  })

  storage.on('moduleQueried', async ({ query, payloads }) => {
    const wrapper = await QueryBoundWitnessWrapper.parseQuery<ModuleQuery>(query, payloads)
    expect(await wrapper.getQuery()).toBeDefined()
    console.log(`Queried: ${(await wrapper.getQuery()).schema}`)
  })

  const inserted = await storage.insert([wrapper.payload()])

  expect(inserted).toBeArrayOfSize(1)

  const fromStorage = await storage.get([await wrapper.dataHash()])
  const fromMemory = await memory.get([await wrapper.dataHash()])

  expect(fromStorage).toBeArrayOfSize(1)
  expect(fromMemory).toBeArrayOfSize(1)

  storage.on('cleared', async ({ module }) => {
    const all = await asArchivistInstance(module)?.all?.()
    expect(all).toBeEmpty()
    console.log('Cleared Storage Archivist')
  })

  await storage.clear()
})
