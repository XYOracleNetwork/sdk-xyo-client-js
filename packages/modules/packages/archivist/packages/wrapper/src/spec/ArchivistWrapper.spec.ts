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
    const wallet = Account.randomSync()
    const archivist = await MemoryArchivist.create({ account: Account.randomSync(), config: { schema: MemoryArchivist.defaultConfigSchema } })
    const wrapper = ArchivistWrapper.wrap(archivist, wallet)
    expect(isArchivistInstance(wrapper)).toBeTruthy()
    expect(isArchivistModule(wrapper)).toBeTruthy()
    expect(ArchivistWrapper.is(wrapper)).toBe(true)
  })
})
