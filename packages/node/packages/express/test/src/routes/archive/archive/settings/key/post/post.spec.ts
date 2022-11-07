import { ReasonPhrases, StatusCodes } from 'http-status-codes'
import { validate } from 'uuid'

import { claimArchive, createArchiveKey, getTokenForUnitTestUser } from '../../../../../../testUtil'

const oneMinuteInMs = 1 * 60 * 1000

describe('/archive/:archive/settings/key', () => {
  let token = ''
  let archive = ''
  beforeAll(async () => {
    token = await getTokenForUnitTestUser()
  })
  beforeEach(async () => {
    archive = (await claimArchive(token)).archive
  })
  it('Creates a key for the archive', async () => {
    const response = await createArchiveKey(token, archive)

    expect(response).toBeTruthy()

    const { created, key } = response

    expect(key).toBeTruthy()
    expect(validate(key)).toBeTruthy()

    expect(created).toBeTruthy()
    const createdDate = new Date(created ?? 0)
    const now = new Date()
    expect(now.getTime() - createdDate.getTime()).toBeLessThan(oneMinuteInMs)
  })
  it('Allows multiple keys to be created for the archive', async () => {
    await createArchiveKey(token, archive)
    await createArchiveKey(token, archive)
  })
  it(`Returns ${ReasonPhrases.FORBIDDEN} when user attempts to create keys for archive they do not own`, async () => {
    await createArchiveKey(token, 'user-does-not-own-this-archive', StatusCodes.FORBIDDEN)
  })
})
