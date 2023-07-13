/**
 * @jest-environment jsdom
 */

import { asArchivistInstance } from '@xyo-network/archivist-model'
import { QueryBoundWitnessWrapper } from '@xyo-network/boundwitness-builder'
import { MemoryArchivist } from '@xyo-network/memory-archivist'
import { ModuleQuery } from '@xyo-network/module'
import { MemoryNode } from '@xyo-network/node'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { StorageArchivist, StorageArchivistConfigSchema } from '../StorageArchivist'

test('Archivist Parent Write Through', async () => {
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
  await node.register(memory)
  await node.attach(memory.address)
  await node.register(storage)
  await node.attach(storage.address)

  const wrapper = PayloadWrapper.wrap({ schema: 'network.xyo.test' })

  expect(wrapper).toBeDefined()

  storage.on('inserted', ({ boundWitnesses }) => {
    expect(boundWitnesses.length).toBeGreaterThan(0)
  })

  storage.on('moduleQueried', async ({ query, payloads }) => {
    const wrapper = QueryBoundWitnessWrapper.parseQuery<ModuleQuery>(query, payloads)
    expect(await wrapper.getQuery()).toBeDefined()
    console.log(`Queried: ${(await wrapper.getQuery()).schema}`)
  })

  const inserted = await storage.insert([wrapper.payload()])

  expect(inserted).toBeArrayOfSize(2)

  const fromStorage = await storage.get([await wrapper.hashAsync()])
  const fromMemory = await memory.get([await wrapper.hashAsync()])

  expect(fromStorage).toBeArrayOfSize(1)
  expect(fromMemory).toBeArrayOfSize(1)

  storage.on('cleared', async ({ module }) => {
    const all = await asArchivistInstance(module)?.all?.()
    expect(all).toBeEmpty()
    console.log('Cleared Storage Archivist')
  })

  await storage.clear()
})
