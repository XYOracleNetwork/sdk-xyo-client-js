import { claimArchive, getArchive, getArchiveName, getTokenForUnitTestUser } from '../../../../testUtil'

describe('/archive', () => {
  let token = ''
  let archive = ''
  beforeAll(async () => {
    token = await getTokenForUnitTestUser()
    archive = getArchiveName()
    await claimArchive(token, archive)
  })
  it('Gets information about the archive', async () => {
    const response = await getArchive(archive, token)
    expect(response.archive).toEqual(archive)
  })
})
