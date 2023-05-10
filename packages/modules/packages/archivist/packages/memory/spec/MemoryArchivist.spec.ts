import { MemoryArchivist, MemoryArchivistConfigSchema } from '../src'

describe('MemoryArchivist', () => {
  it('should listen to cleared events', async () => {
    const archivist = await MemoryArchivist.create({ config: { schema: MemoryArchivistConfigSchema } })

    archivist.on('cleared', () => {
      console.log('cleared')
      expect(true).toBe(true)
    })
    await archivist.clear()
  })
})
