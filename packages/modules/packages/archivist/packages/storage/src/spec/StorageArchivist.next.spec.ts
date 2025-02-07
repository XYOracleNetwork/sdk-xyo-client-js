import { delay } from '@xylabs/delay'
import { Account } from '@xyo-network/account'
import { generateArchivistNextTests } from '@xyo-network/archivist-acceptance-tests'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import type { Payload, WithStorageMeta } from '@xyo-network/payload-model'
import { v4 } from 'uuid'
import {
  describe, expect,
  it,
} from 'vitest'

import { StorageArchivist, StorageArchivistConfigSchema } from '../StorageArchivist.ts'

describe('next', () => {
  it('next', async () => {
    const archivist = await StorageArchivist.create({
      account: 'random',
      config: {
        namespace: 'test-next',
        schema: StorageArchivistConfigSchema,
        type: 'local',
      },
    })

    const account = await Account.random()

    const payloads1 = [
      { schema: 'network.xyo.test', value: 1 },
      { schema: 'network.xyo.test', value: 2 },
    ]

    // console.log('Payloads1:', toJsonString(await PayloadBuilder.hashPairs(payloads1), 10))

    await delay(1)

    const payloads2 = [
      { schema: 'network.xyo.test', value: 3 },
      { schema: 'network.xyo.test', value: 4 },
    ]

    // console.log('Payloads2:', toJsonString(await PayloadBuilder.hashPairs(payloads2), 10))

    const insertedPayloads1 = await archivist.insert(payloads1)
    // console.log(toJsonString(payloads1, 10))
    const [bw, insertedPayloads2, errors] = await archivist.insertQuery(payloads2, account)
    expect(bw).toBeDefined()
    expect(insertedPayloads2).toBeDefined()
    expect(errors).toBeDefined()

    const sortedInsertedPayloads1 = insertedPayloads1.toSorted(PayloadBuilder.compareStorageMeta)
    const sortedInsertedPayloads2 = (insertedPayloads2 as WithStorageMeta<Payload>[]).sort((PayloadBuilder.compareStorageMeta))

    // console.log(toJsonString([bw, payloads, errors], 10))

    const batch1 = await archivist.next?.({ limit: 2 })
    expect(batch1.length).toBe(2)
    expect(await PayloadBuilder.dataHash(batch1?.[0])).toEqual(await PayloadBuilder.dataHash(sortedInsertedPayloads1[0]))

    const batch2 = await archivist.next?.({ limit: 2, cursor: batch1?.[1]._sequence })
    expect(batch2.length).toBe(2)
    expect(await PayloadBuilder.dataHash(batch2?.[0])).toEqual(await PayloadBuilder.dataHash(sortedInsertedPayloads2[0]))

    const batch3 = await archivist.next?.({ limit: 20, cursor: batch1?.[1]._sequence })
    expect(batch3.length).toBe(2)
    expect(await PayloadBuilder.dataHash(batch3?.[0])).toEqual(await PayloadBuilder.dataHash(sortedInsertedPayloads2[0]))

    // desc
    const batch1Desc = await archivist.next?.({ limit: 2, order: 'desc' })
    expect(batch1Desc.length).toBe(2)
    expect(await PayloadBuilder.dataHash(batch1Desc?.[0])).toEqual(await PayloadBuilder.dataHash(sortedInsertedPayloads2[1]))

    const batch2Desc = await archivist.next?.({
      limit: 2, cursor: batch1Desc?.[1]._sequence, order: 'desc',
    })
    expect(batch2Desc.length).toBe(2)
    expect(await PayloadBuilder.dataHash(batch2Desc?.[1])).toEqual(await PayloadBuilder.dataHash(sortedInsertedPayloads1[0]))

    const batch3Desc = await archivist.next?.({
      limit: 20, cursor: batch1Desc?.[1]._sequence, order: 'desc',
    })
    expect(batch3Desc.length).toBe(2)
    expect(await PayloadBuilder.dataHash(batch3Desc?.[1])).toEqual(await PayloadBuilder.dataHash(sortedInsertedPayloads1[0]))
  })
  generateArchivistNextTests(async () => {
    const namespace = v4()
    return await StorageArchivist.create({
      account: 'random',
      config: {
        namespace, schema: StorageArchivistConfigSchema, type: 'local',
      },
    })
  }, 'next [local]')
  generateArchivistNextTests(async () => {
    const namespace = v4()
    return await StorageArchivist.create({
      account: 'random',
      config: {
        namespace, schema: StorageArchivistConfigSchema, type: 'session',
      },
    })
  }, 'next [session]')
  generateArchivistNextTests(async () => {
    const namespace = v4()
    return await StorageArchivist.create({
      account: 'random',
      config: {
        namespace, schema: StorageArchivistConfigSchema, type: 'page',
      },
    })
  }, 'next [page]')
})
