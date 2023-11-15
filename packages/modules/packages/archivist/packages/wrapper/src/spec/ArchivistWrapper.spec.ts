import { Account } from '@xyo-network/account'
import { MemoryArchivist } from '@xyo-network/memory-archivist'

import { ArchivistWrapper } from '../ArchivistWrapper'

/**
 * @group module
 * @group archivist
 */

describe('ArchivistWrapper', () => {
  it('check is type check', async () => {
    const wallet = Account.randomSync()
    const archivist = await MemoryArchivist.create({ account: Account.randomSync(), config: { schema: MemoryArchivist.configSchema } })
    const wrapper = ArchivistWrapper.wrap(archivist, wallet)
    expect(ArchivistWrapper.is(wrapper)).toBe(true)
  })
})
