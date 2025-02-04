import '@xylabs/vitest-extended'

import { MemoryArchivist } from '@xyo-network/archivist-memory'
import { asArchivistInstance } from '@xyo-network/archivist-model'
import { QueryBoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import type { ModuleQueries } from '@xyo-network/module-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import {
  expect,
  test,
} from 'vitest'

import { StorageArchivist, StorageArchivistConfigSchema } from '../StorageArchivist.ts'

/**
 * @group module
 * @group archivist
 */

test('Archivist Parent Write Through', async () => {
  const node = await MemoryNode.create({ account: 'random' })
  const memory = await MemoryArchivist.create({ account: 'random' })

  const storage = (await StorageArchivist.create({
    account: 'random',
    config: {
      namespace: 'test',
      parents: { write: [memory.address] },
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

  storage.on('inserted', ({ payloads }) => {
    expect(payloads.length).toBeGreaterThan(0)
  })

  storage.on('moduleQueried', async ({ query, payloads }) => {
    const wrapper = QueryBoundWitnessWrapper.parseQuery<ModuleQueries>(query, payloads)
    expect(await wrapper.getQuery()).toBeDefined()
    console.log(`Queried: ${(await wrapper.getQuery()).schema}`)
  })

  const inserted = await storage.insert([wrapper.payload])

  expect(inserted).toBeArrayOfSize(1)

  const fromStorage = await storage.get([await wrapper.dataHash()])
  const fromMemory = await memory.get([await wrapper.dataHash()])

  expect(fromStorage).toBeArrayOfSize(1)
  expect(fromMemory).toBeArrayOfSize(1)

  storage.on('cleared', async ({ mod }) => {
    const all = await asArchivistInstance(mod)?.all?.()
    expect(all).toBeEmpty()
    console.log('Cleared Storage Archivist')
  })

  await storage.clear()
})
