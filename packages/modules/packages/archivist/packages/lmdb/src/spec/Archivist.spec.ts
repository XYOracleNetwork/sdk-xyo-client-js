/* eslint-disable max-statements */
import '@xylabs/vitest-extended'

import { tmpdir } from 'node:os'

import { delay } from '@xylabs/delay'
import { toJsonString } from '@xylabs/object'
import { HDWallet } from '@xyo-network/account'
import { isArchivistInstance, isArchivistModule } from '@xyo-network/archivist-model'
import type { Id } from '@xyo-network/id-payload-plugin'
import {
  asId,
  IdSchema, isId,
} from '@xyo-network/id-payload-plugin'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import {
  describe, expect, it,
} from 'vitest'

import { LmdbArchivist } from '../Archivist.ts'
import { LmdbArchivistConfigSchema } from '../Config.ts'

/**
 * @group module
 * @group archivist
 */
describe('LmdbArchivist', () => {
  it('should listen to cleared events', async () => {
    const archivist = await LmdbArchivist.create({
      account: 'random',
      config: {
        schema: LmdbArchivistConfigSchema, location: tmpdir(), dbName: 'test1.db', storeName: 'payloads', clearStoreOnStart: true,
      },
    })

    expect(isArchivistInstance(archivist)).toBe(true)
    expect(isArchivistModule(archivist)).toBe(true)

    // Create a new promise and resolve it when the event fires
    const eventPromise = new Promise<void>((resolve) => {
      archivist.on('cleared', () => {
        expect(true).toBe(true) // Confirm event fired
        resolve() // Resolve the promise
      })
    })
    await archivist.clear()
    return eventPromise
  })

  it('should return items inserted in the order they were provided in', async () => {
    const archivist = await LmdbArchivist.create({
      account: 'random',
      config: {
        schema: LmdbArchivistConfigSchema, location: tmpdir(), dbName: 'test2.db', storeName: 'payloads', clearStoreOnStart: true,
      },
    })
    const payloads: Id[] = Array.from({ length: 100 }, (_, i) => new PayloadBuilder<Id>({ schema: IdSchema }).fields({ salt: `${i}` }).build())
    // Ensure payload was create in order provided
    for (const [index, id] of payloads.entries()) {
      expect(id?.salt).toBe(`${index}`)
    }

    const withStorageMeta = await PayloadBuilder.addStorageMeta(payloads)

    // Ensure payload was returned in order provided
    for (const [index, result] of withStorageMeta.entries()) {
      expect(isId(result)).toBe(true)
      const id = asId(result)
      expect(id).toBeDefined()
      expect(id?.salt).toBe(`${index}`)
      expect(await PayloadBuilder.dataHash(result)).toEqual(await PayloadBuilder.dataHash(payloads[index]))
    }

    const results = await archivist.insert(payloads)
    expect(results.length).toBe(payloads.length)

    // Ensure payload was inserted in order provided
    for (const [index, result] of results.entries()) {
      expect(isId(result)).toBe(true)
      const id = asId(result)
      expect(id).toBeDefined()
      if (index > 0) {
        expect(result._sequence > results[index - 1]._sequence).toBeTrue()
      }
      if (index < 99) {
        expect(result._sequence < results[index + 1]._sequence).toBeTrue()
      }
      if (id?.salt !== `${index}`) {
        console.warn('result-', results[index - 1])
        console.warn('result', result)
        console.warn('result+', results[index + 1])
      }
      expect(id?.salt).toBe(`${index}`)
      expect(await PayloadBuilder.dataHash(result)).toEqual(await PayloadBuilder.dataHash(payloads[index]))
    }
  })

  it('next', async () => {
    const archivist = await LmdbArchivist.create({
      account: await HDWallet.random(),
      config: {
        schema: LmdbArchivistConfigSchema, location: tmpdir(), dbName: 'test3.db', storeName: 'payloads', clearStoreOnStart: true,
      },
    })
    const account = await HDWallet.random()

    const payloads1 = [
      { schema: 'network.xyo.test', value: 1 },
    ]

    const payloads2 = [
      { schema: 'network.xyo.test', value: 2 },
    ]

    const payloads3 = [
      { schema: 'network.xyo.test', value: 3 },
    ]

    const payloads4 = [
      { schema: 'network.xyo.test', value: 4 },
    ]

    const insertedPayloads1 = await archivist.insert(payloads1)
    expect(insertedPayloads1[0]._hash).toBe(await PayloadBuilder.hash(payloads1[0]))
    expect(insertedPayloads1[0]._dataHash).toBe(await PayloadBuilder.dataHash(payloads1[0]))
    expect(insertedPayloads1[0]._sequence).toBeDefined()
    await delay(1)
    console.log(toJsonString(payloads1, 10))
    const [bw, payloads, errors] = await archivist.insertQuery(payloads2, account)
    expect(bw).toBeDefined()
    expect(payloads).toBeDefined()
    expect(errors).toBeDefined()
    await delay(1)
    await archivist.insert(payloads3)
    await delay(1)
    await archivist.insert(payloads4)

    console.log('bw', toJsonString([bw, payloads, errors], 10))

    const batch1 = await archivist.next?.({ limit: 2 })
    expect(batch1).toBeArrayOfSize(2)
    expect(await PayloadBuilder.dataHash(batch1?.[0])).toEqual(await PayloadBuilder.dataHash(payloads1[0]))
    expect(await PayloadBuilder.dataHash(batch1?.[0])).toEqual(await PayloadBuilder.dataHash(insertedPayloads1[0]))

    const batch2 = await archivist.next?.({ limit: 2, cursor: batch1?.[0]._sequence })
    expect(batch2).toBeArrayOfSize(2)
    expect(await PayloadBuilder.dataHash(batch2?.[0])).toEqual(await PayloadBuilder.dataHash(payloads2[0]))
    expect(await PayloadBuilder.dataHash(batch2?.[1])).toEqual(await PayloadBuilder.dataHash(payloads3[0]))

    // desc
    const batch1Desc = await archivist.next?.({ limit: 2, order: 'desc' })
    expect(batch1Desc).toBeArrayOfSize(2)
    expect(await PayloadBuilder.dataHash(batch1Desc?.[0])).toEqual(await PayloadBuilder.dataHash(payloads4[0]))
    expect(await PayloadBuilder.dataHash(batch1Desc?.[1])).toEqual(await PayloadBuilder.dataHash(payloads3[0]))

    const batch2Desc = await archivist.next?.({
      limit: 2, cursor: batch1Desc[1]._sequence, order: 'desc',
    })
    expect(batch2Desc).toBeArrayOfSize(2)
    expect(await PayloadBuilder.dataHash(batch2Desc?.[0])).toEqual(await PayloadBuilder.dataHash(payloads2[0]))
    expect(await PayloadBuilder.dataHash(batch2Desc?.[1])).toEqual(await PayloadBuilder.dataHash(payloads1[0]))
  })
})
