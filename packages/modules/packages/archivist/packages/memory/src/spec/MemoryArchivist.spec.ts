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
})
