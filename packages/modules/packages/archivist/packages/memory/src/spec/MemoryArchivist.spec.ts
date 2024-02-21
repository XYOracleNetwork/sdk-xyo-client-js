/**
 * @jest-environment jsdom
 */
import { Account } from '@xyo-network/account'
import { isArchivistInstance, isArchivistModule } from '@xyo-network/archivist-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'

import { MemoryArchivist } from '../MemoryArchivist'

/**
 * @group module
 * @group archivist
 */
describe('MemoryArchivist', () => {
  it('should listen to cleared events', async () => {
    const archivist = await MemoryArchivist.create({ account: Account.randomSync(), config: { schema: MemoryArchivist.configSchema } })

    expect(isArchivistInstance(archivist)).toBe(true)
    expect(isArchivistModule(archivist)).toBe(true)

    archivist.on('cleared', () => {
      console.log('cleared')
      expect(true).toBe(true)
    })
    await archivist.clear()
  })

  it('should return same items inserted', async () => {
    const archivist = await MemoryArchivist.create({ account: Account.randomSync(), config: { schema: MemoryArchivist.configSchema } })

    const payloads = [await PayloadBuilder.build({ schema: 'network.xyo.test' })]
    const result = await archivist.insert(payloads)

    expect(result.length).toEqual(payloads.length)
    expect(result[0].schema).toEqual(payloads[0].schema)
  })

  it('next', async () => {
    const archivist = await MemoryArchivist.create({ account: Account.randomSync(), config: { schema: MemoryArchivist.configSchema } })

    const payloads1 = [
      await PayloadBuilder.build({ schema: 'network.xyo.test', value: 1 }),
      await PayloadBuilder.build({ schema: 'network.xyo.test', value: 2 }),
    ]

    const payloads2 = [
      await PayloadBuilder.build({ schema: 'network.xyo.test', value: 3 }),
      await PayloadBuilder.build({ schema: 'network.xyo.test', value: 4 }),
    ]
    await archivist.insert(payloads1)
    await archivist.insert(payloads2)

    const batch1 = await archivist.next?.({ limit: 2 })
    expect(batch1).toBeArrayOfSize(2)
    expect(batch1?.[0].$hash).toEqual(payloads1[0].$hash)

    const batch2 = await archivist.next?.({ limit: 2, previous: batch1?.[0].$hash })
    expect(batch2).toBeArrayOfSize(2)
    expect(batch2?.[1].$hash).toEqual(payloads2[0].$hash)
  })
})
