import { delay } from '@xylabs/delay'
import { Account } from '@xyo-network/account'
import { MemoryArchivist } from '@xyo-network/archivist-memory'
import {
  ArchivistInstance, isArchivistInstance, isArchivistModule,
} from '@xyo-network/archivist-model'
import { IdSchema } from '@xyo-network/id-payload-plugin'
import {
  isModule, isModuleInstance, isModuleObject,
} from '@xyo-network/module-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import {
  describe, expect,
  it, test,
} from 'vitest'

import { StorageArchivist, StorageArchivistConfigSchema } from '../StorageArchivist.ts'

/**
 * @group module
 * @group jsdom
 * @group archivist
 */

describe('Various StorageArchivist types', () => {
  const archivistTests: [string, Promise<ArchivistInstance>][] = [
    [
      'local',
      (async () =>
        await StorageArchivist.create({
          account: 'random',
          config: {
            namespace: 'test', schema: StorageArchivistConfigSchema, type: 'local',
          },
        }))(),
    ],
    [
      'session',
      (async () =>
        await StorageArchivist.create({
          account: 'random',
          config: {
            namespace: 'test', schema: StorageArchivistConfigSchema, type: 'session',
          },
        }))(),
    ],
    [
      'page',
      (async () =>
        await StorageArchivist.create({
          account: 'random',
          config: {
            namespace: 'test', schema: StorageArchivistConfigSchema, type: 'page',
          },
        }))(),
    ],
  ]
  it.each(archivistTests)('Archivist All', async (_name, archivistPromise) => {
    const archivist = await archivistPromise
    expect(isArchivistInstance(archivist)).toBeTruthy()
    expect(isArchivistModule(archivist)).toBeTruthy()
    const idPayload = {
      salt: Date.now().toString(),
      schema: IdSchema,
    }
    for (let x = 0; x < 10; x++) {
      await archivist.insert([idPayload])
      await delay(10)
    }
    const getResult = await archivist.all?.()
    expect(getResult).toBeDefined()
    expect(getResult?.length).toBe(1)
  })
  it.each(archivistTests)('Archivist RoundTrip', async (_name, archivistPromise) => {
    const idPayload: Payload<{ salt: string }> = {
      salt: Date.now().toString(),
      schema: IdSchema,
    }
    const payloadWrapper = PayloadWrapper.wrap(idPayload)

    const archivist = await archivistPromise
    const insertResult = await archivist.insert([idPayload])
    expect(insertResult).toBeDefined()

    const getResult = await archivist.get([await payloadWrapper.dataHash()])
    expect(getResult).toBeDefined()
    expect(getResult.length).toBe(1)
    const gottenPayload = getResult[0]
    if (gottenPayload) {
      const gottenPayloadWrapper = PayloadWrapper.wrap(gottenPayload)
      expect(await gottenPayloadWrapper.dataHash()).toBe(await payloadWrapper.dataHash())
    }
  })
})

test('Archivist Private Key Save', async () => {
  const account = await Account.random()
  const storage = await StorageArchivist.create({
    account,
    config: {
      namespace: 'test', schema: StorageArchivistConfigSchema, type: 'local',
    },
  })
  const address = storage.address
  const storage2 = await StorageArchivist.create({
    account,
    config: {
      namespace: 'test', schema: StorageArchivistConfigSchema, type: 'local',
    },
  })
  expect(storage2.address).toBe(address)
})

test('Archivist passed account', async () => {
  const account = await Account.random()

  const storage = (await StorageArchivist.create({
    account,
    config: {
      namespace: 'main', schema: StorageArchivistConfigSchema, type: 'local',
    },
  })) as StorageArchivist

  expect(storage['account'].address).toBe(account.address)
})

test('Archivist Parent Reads', async () => {
  const parent = await MemoryArchivist.create({ account: 'random' })
  const memoryNode = await MemoryNode.create({ account: 'random' })

  expect(isModuleObject(parent)).toBe(true)

  expect(isModule(parent)).toBe(true)

  expect(isModuleInstance(parent)).toBe(true)

  expect(isArchivistInstance(parent)).toBe(true)

  await memoryNode.register(parent)
  await memoryNode.attach(parent.address, true)

  const storage = await StorageArchivist.create({
    account: 'random',
    config: {
      namespace: 'test',
      parents: { read: [parent.address] },
      schema: StorageArchivistConfigSchema,
      type: 'local',
    },
  })
  await memoryNode.register(storage)
  await memoryNode.attach(storage.address, true)

  const wrapper = PayloadWrapper.wrap({ schema: 'network.xyo.test' })

  expect(wrapper).toBeDefined()

  const inserted = await parent.insert([wrapper.payload])

  expect(inserted.length).toBe(1)

  const fromStorage = await storage.get([await wrapper.dataHash()])

  expect(fromStorage.length).toBe(1)
})
