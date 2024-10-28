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
      await PayloadBuilder.build({ schema: 'network.xyo.test', value: 1 }),
      await PayloadBuilder.build({ schema: 'network.xyo.test', value: 2 }),
    ]

    // console.log('Payloads1:', toJsonString(await PayloadBuilder.hashPairs(payloads1), 10))

    const payloads2 = [
      await PayloadBuilder.build({ schema: 'network.xyo.test', value: 3 }),
      await PayloadBuilder.build({ schema: 'network.xyo.test', value: 4 }),
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
    expect(batch1?.[0].$hash).toEqual(payloads1[0].$hash)

    const batch2 = await archivist.next?.({ limit: 2, offset: await PayloadBuilder.hash(batch1?.[1]) })
    expect(batch2.length).toBe(2)
    expect(batch2?.[0].$hash).toEqual(payloads2[0].$hash)

    const batch3 = await archivist.next?.({ limit: 20, offset: await PayloadBuilder.hash(batch1?.[1]) })
    expect(batch3.length).toBe(2)
    expect(batch3?.[0].$hash).toEqual(payloads2[0].$hash)

    // desc
    const batch1Desc = await archivist.next?.({ limit: 2, order: 'desc' })
    expect(batch1Desc.length).toBe(2)
    expect(batch1Desc?.[0].$hash).toEqual(payloads2[1].$hash)

    const batch2Desc = await archivist.next?.({
      limit: 2, offset: await PayloadBuilder.hash(batch1Desc?.[1]), order: 'desc',
    })
    expect(batch2Desc.length).toBe(2)
    expect(batch2Desc?.[1].$hash).toEqual(payloads1[0].$hash)

    const batch3Desc = await archivist.next?.({
      limit: 20, offset: await PayloadBuilder.hash(batch1Desc?.[1]), order: 'desc',
    })
    expect(batch3Desc.length).toBe(2)
    expect(batch3Desc?.[1].$hash).toEqual(payloads1[0].$hash)
  })
})
