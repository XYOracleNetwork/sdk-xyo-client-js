import { getArchivists } from './getArchivists'

describe('getArchivists', () => {
  it('returns the default archivists specified by the ENV if no configs supplied', async () => {
    const archivists = await getArchivists()
    expect(archivists).toBeTruthy()
    expect(Array.isArray(archivists)).toBeTruthy()
    expect(archivists.length).toBeGreaterThan(0)
  })
})
