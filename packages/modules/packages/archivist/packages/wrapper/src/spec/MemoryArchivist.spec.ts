import { Account } from '@xyo-network/account'
import { MemoryArchivist } from '@xyo-network/archivist-memory'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { asSchema } from '@xyo-network/payload-model'
import {
  describe, expect, it,
} from 'vitest'

import { ArchivistWrapper } from '../ArchivistWrapper.ts'

/**
 * @group module
 * @group archivist
 */
describe('MemoryArchivist (Wrapped)', () => {
  it('should return same items inserted (wrapped)', async () => {
    const archivist = ArchivistWrapper.wrap(
      await MemoryArchivist.create({ account: 'random', config: { schema: MemoryArchivist.defaultConfigSchema } }),
      await Account.random(),
    )

    const payloads = [{ schema: asSchema('network.xyo.test', true) }]
    const result = await archivist.insert(payloads)

    expect(result[0]._hash).toEqual(await PayloadBuilder.hash(payloads[0]))
    expect(result.length).toEqual(payloads.length)
    expect(result[0].schema).toEqual(payloads[0].schema)
  })
})
