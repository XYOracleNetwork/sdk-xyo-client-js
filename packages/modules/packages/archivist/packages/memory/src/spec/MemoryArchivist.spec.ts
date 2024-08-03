import { toJsonString } from '@xylabs/object'
import { HDWallet } from '@xyo-network/account'
import { isArchivistInstance, isArchivistModule } from '@xyo-network/archivist-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'

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

    const payloads = [await PayloadBuilder.build({ schema: 'network.xyo.test' }, { stamp: false })]
    expect(payloads[0].$meta?.timestamp).toBeUndefined()
    const result = await archivist.insert(payloads)

    expect(result.length).toEqual(payloads.length)
    expect(result[0].schema).toEqual(payloads[0].schema)
    expect(result[0].$meta?.timestamp).toBeUndefined()
  })

  it('next', async () => {
    const archivist = await MemoryArchivist.create({ account: await HDWallet.random() })
    const account = await HDWallet.random()

    const payloads1 = [
      await PayloadBuilder.build({ schema: 'network.xyo.test', value: 1 }),
      await PayloadBuilder.build({ schema: 'network.xyo.test', value: 2 }),
    ]

    const payloads2 = [
      await PayloadBuilder.build({ schema: 'network.xyo.test', value: 3 }),
      await PayloadBuilder.build({ schema: 'network.xyo.test', value: 4 }),
    ]
    await archivist.insert(payloads1)
    console.log(toJsonString(payloads1, 10))
    const [bw, payloads, errors] = await archivist.insertQuery(payloads2, account)
    expect(bw).toBeDefined()
    expect(payloads).toBeDefined()
    expect(errors).toBeDefined()

    console.log(toJsonString([bw, payloads, errors], 10))

    const batch1 = await archivist.next?.({ limit: 2 })
    expect(batch1).toBeArrayOfSize(2)
    expect(batch1?.[0].$hash).toEqual(payloads1[0].$hash)

    const batch2 = await archivist.next?.({ limit: 2, offset: await PayloadBuilder.hash(batch1?.[0]) })
    expect(batch2).toBeArrayOfSize(2)
    expect(batch2?.[1].$hash).toEqual(payloads2[0].$hash)

    // desc
    const batch1Desc = await archivist.next?.({ limit: 2, order: 'desc' })
    expect(batch1Desc).toBeArrayOfSize(2)
    expect(batch1Desc?.[0].$hash).toEqual(payloads2[1].$hash)

    const batch2Desc = await archivist.next?.({ limit: 2, offset: await PayloadBuilder.hash(batch2?.[1]), order: 'desc' })
    expect(batch2Desc).toBeArrayOfSize(2)
    expect(batch2Desc?.[1].$hash).toEqual(payloads1[0].$hash)
  })
})
