import { StatusCodes } from 'http-status-codes'

import {
  claimArchive,
  getArchive,
  getTokenForOtherUnitTestUser,
  getTokenForUnitTestUser,
  invalidateToken,
  setArchiveAccessControl,
} from '../../../../testUtil'

describe('/archive/{:archive}', () => {
  let archive = ''
  let ownerToken = ''
  let otherUserToken = ''
  beforeAll(async () => {
    ownerToken = await getTokenForUnitTestUser()
    otherUserToken = await getTokenForOtherUnitTestUser()
  })
  describe('with public archive', () => {
    beforeAll(async () => {
      // Create public archive
      archive = (await claimArchive(ownerToken)).archive
      await setArchiveAccessControl(ownerToken, archive, { accessControl: false, archive })
    })
    it('with token absent allows access', async () => {
      await getArchive(archive, undefined, StatusCodes.OK)
    })
    it('with token for user who owns the archive allows access', async () => {
      await getArchive(archive, ownerToken, StatusCodes.OK)
    })
    it('with token for user who does not own the archive allows access', async () => {
      await getArchive(archive, otherUserToken, StatusCodes.OK)
    })
    it('with invalid token does not allow access', async () => {
      const newToken = invalidateToken(ownerToken)
      await getArchive(archive, newToken, StatusCodes.UNAUTHORIZED)
    })
  })
  describe('with private archive', () => {
    beforeAll(async () => {
      // Create private archive
      archive = (await claimArchive(ownerToken)).archive
      await setArchiveAccessControl(ownerToken, archive, { accessControl: true, archive })
    })
    it('with token absent does not allow access', async () => {
      await getArchive(archive, undefined, StatusCodes.UNAUTHORIZED)
    })
    it('with token for user who owns the archive allows access', async () => {
      await getArchive(archive, ownerToken, StatusCodes.OK)
    })
    it('with token for user who does not own the archive does not allow access', async () => {
      await getArchive(archive, otherUserToken, StatusCodes.FORBIDDEN)
    })
    it('with invalid token does not allow access', async () => {
      const newToken = invalidateToken(ownerToken)
      await getArchive(archive, newToken, StatusCodes.UNAUTHORIZED)
    })
  })
})
