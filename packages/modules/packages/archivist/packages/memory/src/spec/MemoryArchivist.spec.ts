/* eslint-disable max-statements */
import '@xylabs/vitest-extended'

import { delay } from '@xylabs/delay'
import { toJsonString } from '@xylabs/object'
import { HDWallet } from '@xyo-network/account'
import { isArchivistInstance, isArchivistModule } from '@xyo-network/archivist-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import {
  describe, expect, it,
} from 'vitest'

import { MemoryArchivist } from '../MemoryArchivist.ts'

/**
 * @group module
 * @group archivist
 */
describe('MemoryArchivist', () => {
  it('should listen to cleared events', async () => {
    const archivist = await MemoryArchivist.create({ account: 'random' })

    expect(isArchivistInstance(archivist)).toBe(true)
    expect(isArchivistModule(archivist)).toBe(true)

    archivist.on('cleared', () => {
      console.log('cleared')
      expect(true).toBe(true)
    })
    await archivist.clear()
  })

  it('should return same items inserted', async () => {
    const archivist = await MemoryArchivist.create({ account: 'random' })

    const payloads = [{ schema: 'network.xyo.test' }]
    const result = await archivist.insert(payloads)

    expect(result.length).toEqual(payloads.length)
    expect(result[0].schema).toEqual(payloads[0].schema)
  })

  it('next', async () => {
    const archivist = await MemoryArchivist.create({ account: await HDWallet.random() })
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

    console.log(toJsonString([bw, payloads, errors], 10))

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
