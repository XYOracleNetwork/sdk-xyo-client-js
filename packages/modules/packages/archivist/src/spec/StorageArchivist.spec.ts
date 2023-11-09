/**
 * @jest-environment jsdom
 */

import { delay } from '@xylabs/delay'
import { Account } from '@xyo-network/account'
import { ArchivistInstance, isArchivistInstance } from '@xyo-network/archivist-model'
import { IdSchema } from '@xyo-network/id-payload-plugin'
import { MemoryArchivist } from '@xyo-network/memory-archivist'
import { isModule, isModuleInstance, isModuleObject } from '@xyo-network/module-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { StorageArchivist, StorageArchivistConfigSchema } from '../StorageArchivist'

describe('Various StorageArchivist types', () => {
  const archivistTests: [string, Promise<ArchivistInstance>][] = [
    [
      'local',
      (async () =>
        await StorageArchivist.create({
          account: Account.randomSync(),
          config: { namespace: 'test', schema: StorageArchivistConfigSchema, type: 'local' },
        }))(),
    ],
    [
      'session',
      (async () =>
        await StorageArchivist.create({
          account: Account.randomSync(),
          config: { namespace: 'test', schema: StorageArchivistConfigSchema, type: 'session' },
        }))(),
    ],
    [
      'page',
      (async () =>
        await StorageArchivist.create({
          account: Account.randomSync(),
          config: { namespace: 'test', schema: StorageArchivistConfigSchema, type: 'page' },
        }))(),
    ],
  ]
  it.each(archivistTests)('Archivist All', async (_name, archivistPromise) => {
    const archivist = await archivistPromise
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

    const getResult = await archivist.get([await payloadWrapper.hashAsync()])
    expect(getResult).toBeDefined()
    expect(getResult.length).toBe(1)
    const gottenPayload = getResult[0]
    if (gottenPayload) {
      const gottenPayloadWrapper = PayloadWrapper.wrap(gottenPayload)
      expect(await gottenPayloadWrapper.hashAsync()).toBe(await payloadWrapper.hashAsync())
    }
  })
})

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
  const parent = await MemoryArchivist.create({ account: Account.randomSync() })
  const memoryNode = await MemoryNode.create({ account: Account.randomSync() })

  expect(isModuleObject(parent)).toBeTrue()

  expect(isModule(parent)).toBeTrue()

  expect(isModuleInstance(parent)).toBeTrue()

  expect(isArchivistInstance(parent)).toBeTrue()

  await memoryNode.register(parent)
  await memoryNode.attach(parent.address, true)

  const storage = await StorageArchivist.create({
    account: Account.randomSync(),
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
