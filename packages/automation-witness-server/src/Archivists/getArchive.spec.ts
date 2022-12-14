import { getArchive } from './getArchive'

describe('getArchive', () => {
  it('returns the archive from the ENV', () => {
    const archive = getArchive()
    expect(archive).toBeTruthy()
  })
  it('returns the temp archive if no ENV', () => {
    delete process.env.ARCHIVIST_ARCHIVE
    const archive = getArchive()
    expect(archive).toBeTruthy()
  })
})
