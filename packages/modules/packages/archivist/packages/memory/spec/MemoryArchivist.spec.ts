import { isArchivistModule } from '@xyo-network/archivist-model'

import { MemoryArchivist } from '../src'

describe('MemoryArchivist', () => {
  it('should listen to cleared events', async () => {
    const archivist = await MemoryArchivist.create({ config: { schema: MemoryArchivist.configSchema } })

    expect(isArchivistModule(archivist)).toBe(true)

    archivist.on('cleared', () => {
      console.log('cleared')
      expect(true).toBe(true)
    })
    await archivist.clear()
  })
})
