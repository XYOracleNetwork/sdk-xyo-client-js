import { Account } from '@xyo-network/account'
import { MemoryArchivist } from '@xyo-network/archivist-memory'
import { isArchivistInstance, isArchivistModule } from '@xyo-network/archivist-model'

import { ArchivistWrapper } from '../ArchivistWrapper'

/**
 * @group module
 * @group archivist
 */

describe('ArchivistWrapper', () => {
  it('check is type check', async () => {
    const archivist = await MemoryArchivist.create({ account: 'random', config: { schema: MemoryArchivist.defaultConfigSchema } })
    const wrapper = ArchivistWrapper.wrap(archivist, await Account.random())
    expect(isArchivistInstance(wrapper)).toBeTruthy()
    expect(isArchivistModule(wrapper)).toBeTruthy()
    expect(ArchivistWrapper.is(wrapper)).toBe(true)
  })
})
