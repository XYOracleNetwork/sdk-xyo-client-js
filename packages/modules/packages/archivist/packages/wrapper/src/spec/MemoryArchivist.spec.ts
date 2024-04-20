/**
 * @jest-environment jsdom
 */
import { Account } from '@xyo-network/account'
import { MemoryArchivist } from '@xyo-network/archivist-memory'
import { PayloadBuilder } from '@xyo-network/payload-builder'

import { ArchivistWrapper } from '../ArchivistWrapper'

/**
 * @group module
 * @group archivist
 */
describe('MemoryArchivist (Wrapped)', () => {
  it('should return same items inserted (wrapped)', async () => {
    const archivist = ArchivistWrapper.wrap(
      await MemoryArchivist.create({ account: Account.randomSync(), config: { schema: MemoryArchivist.defaultConfigSchema } }),
      Account.randomSync(),
    )

    const payloads = [await PayloadBuilder.build({ schema: 'network.xyo.test' })]
    const result = await archivist.insert(payloads)

    expect(result).toEqual(payloads)
    expect(result.length).toEqual(payloads.length)
    expect(result[0].schema).toEqual(payloads[0].schema)
  })
})
