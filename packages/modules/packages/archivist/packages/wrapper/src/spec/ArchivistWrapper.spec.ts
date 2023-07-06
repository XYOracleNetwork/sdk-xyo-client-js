import { HDWallet } from '@xyo-network/account'
import { MemoryArchivist } from '@xyo-network/memory-archivist'

import { ArchivistWrapper } from '../ArchivistWrapper'

describe('ArchivistWrapper', () => {
  it('check is type check', async () => {
    const wallet = await HDWallet.random()
    const archivist = await MemoryArchivist.create({ config: { schema: MemoryArchivist.configSchema } })
    const wrapper = ArchivistWrapper.wrap(archivist, wallet)
    expect(ArchivistWrapper.is(wrapper)).toBe(true)
  })
})
