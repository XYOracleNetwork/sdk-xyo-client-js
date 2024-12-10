/**
 * @jest-environment jsdom
 */

import { Account } from '@xyo-network/account'
import { PayloadBuilder } from '@xyo-network/payload-builder'
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

    const payloads2 = [
      { schema: 'network.xyo.test', value: 3 },
      { schema: 'network.xyo.test', value: 4 },
    ]

    // console.log('Payloads2:', toJsonString(await PayloadBuilder.hashPairs(payloads2), 10))

    await archivist.insert(payloads1)
    // console.log(toJsonString(payloads1, 10))
    const [bw, payloads, errors] = await archivist.insertQuery(payloads2, account)
    expect(bw).toBeDefined()
    expect(payloads).toBeDefined()
    expect(errors).toBeDefined()

    // console.log(toJsonString([bw, payloads, errors], 10))

    const batch1 = await archivist.next?.({ limit: 2 })
    expect(batch1.length).toBe(2)
    expect(await PayloadBuilder.dataHash(batch1?.[0])).toEqual(await PayloadBuilder.dataHash(payloads1[0]))

    const batch2 = await archivist.next?.({ limit: 2, offset: await PayloadBuilder.hash(batch1?.[1]) })
    expect(batch2.length).toBe(2)
    expect(await PayloadBuilder.dataHash(batch2?.[0])).toEqual(await PayloadBuilder.dataHash(payloads2[0]))

    const batch3 = await archivist.next?.({ limit: 20, offset: await PayloadBuilder.hash(batch1?.[1]) })
    expect(batch3.length).toBe(2)
    expect(await PayloadBuilder.dataHash(batch3?.[0])).toEqual(await PayloadBuilder.dataHash(payloads2[0]))

    // desc
    const batch1Desc = await archivist.next?.({ limit: 2, order: 'desc' })
    expect(batch1Desc.length).toBe(2)
    expect(await PayloadBuilder.dataHash(batch1Desc?.[0])).toEqual(await PayloadBuilder.dataHash(payloads2[1]))

    const batch2Desc = await archivist.next?.({
      limit: 2, offset: await PayloadBuilder.hash(batch1Desc?.[1]), order: 'desc',
    })
    expect(batch2Desc.length).toBe(2)
    expect(await PayloadBuilder.dataHash(batch2Desc?.[1])).toEqual(await PayloadBuilder.dataHash(payloads1[0]))

    const batch3Desc = await archivist.next?.({
      limit: 20, offset: await PayloadBuilder.hash(batch1Desc?.[1]), order: 'desc',
    })
    expect(batch3Desc.length).toBe(2)
    expect(await PayloadBuilder.dataHash(batch3Desc?.[1])).toEqual(await PayloadBuilder.dataHash(payloads1[0]))
  })
})
