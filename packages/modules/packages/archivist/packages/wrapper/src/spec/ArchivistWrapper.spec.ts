import { HDWallet } from '@xyo-network/account'
import { MemoryArchivist } from '@xyo-network/memory-archivist'

import { IndirectArchivistWrapper } from '../IndirectArchivistWrapper'

describe('ArchivistWrapper', () => {
  it('check is type check', async () => {
    const wallet = await HDWallet.random()
    const archivist = await MemoryArchivist.create({ account: await HDWallet.random(), config: { schema: MemoryArchivist.configSchema } })
    const wrapper = IndirectArchivistWrapper.wrap(archivist, wallet)
    expect(IndirectArchivistWrapper.is(wrapper)).toBe(true)
  })
})
