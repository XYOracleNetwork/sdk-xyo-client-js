import { StatusCodes } from 'http-status-codes'

import { claimArchive, getArchiveName, getTokenForOtherUnitTestUser, getTokenForUnitTestUser, request } from '../../../../testUtil'

describe('/archive', () => {
  let token = ''
  let archive = ''
  beforeAll(async () => {
    token = await getTokenForUnitTestUser()
  })
  beforeEach(() => {
    archive = getArchiveName()
  })
  it('Allows user to claim an unclaimed archive', async () => {
    const response = await claimArchive(token, archive, StatusCodes.CREATED)
    expect(response.archive).toEqual(archive)
  })
  it('Allows user to reclaim an archive they already own', async () => {
    let response = await claimArchive(token, archive, StatusCodes.CREATED)
    expect(response.archive).toEqual(archive)
    response = await claimArchive(token, archive, StatusCodes.OK)
    expect(response.archive).toEqual(archive)
  })
  describe('when already claimed by another user', () => {
    beforeAll(() => {
      jest.spyOn(console, 'error').mockImplementation(() => {
        // Stop expected errors from being logged
      })
    })
    it('prevents user from claiming archive ', async () => {
      // User 1 claims archive
      await claimArchive(token, archive)

      // User 2 attempts to claim archive
      const user2Token = await getTokenForOtherUnitTestUser()
      await (await request()).put(`/archive/${archive}`).auth(user2Token, { type: 'bearer' }).expect(StatusCodes.FORBIDDEN)
    })
  })
})
