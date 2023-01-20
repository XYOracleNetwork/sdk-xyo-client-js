import { claimArchive, getTokenForOtherUnitTestUser, getTokenForUnitTestUser, request, setArchiveAccessControl } from '@xyo-network/express-node-test'
import { StatusCodes } from 'http-status-codes'

const attemptRoute = async (archive: string, token: string | undefined = undefined, expectedStatus: StatusCodes = StatusCodes.OK) => {
  return token
    ? await (await request()).get(`/archive/${archive}/payload/recent`).auth(token, { type: 'bearer' }).expect(expectedStatus)
    : await (await request()).get(`/archive/${archive}/payload/recent`).expect(expectedStatus)
}
describe('ArchiveAccessControlAuthStrategy', () => {
  let ownerToken = ''
  let otherUserToken = ''
  let archive = ''
  beforeAll(async () => {
    ownerToken = await getTokenForUnitTestUser()
    otherUserToken = await getTokenForOtherUnitTestUser()
  })
  describe('when accessControl not specified', () => {
    beforeAll(async () => {
      const response = await claimArchive(ownerToken)
      expect(response.accessControl).toBe(false)
      archive = response.archive
    })
    it('allows anonymous access', async () => {
      await attemptRoute(archive)
    })
    it('allows owner access', async () => {
      await attemptRoute(archive, ownerToken)
    })
    it('allows other user access', async () => {
      await attemptRoute(archive, otherUserToken)
    })
  })
  describe('when accessControl is false', () => {
    beforeAll(async () => {
      const response = await claimArchive(ownerToken)
      expect(response.accessControl).toBe(false)
      archive = response.archive
      await setArchiveAccessControl(ownerToken, archive, { accessControl: false, archive })
    })
    it('allows anonymous access', async () => {
      await attemptRoute(archive)
    })
    it('allows owner access', async () => {
      await attemptRoute(archive, ownerToken)
    })
    it('allows other user access', async () => {
      await attemptRoute(archive, otherUserToken)
    })
  })
  describe('when accessControl is true', () => {
    beforeAll(async () => {
      const response = await claimArchive(ownerToken)
      expect(response.accessControl).toBe(false)
      archive = response.archive
      await setArchiveAccessControl(ownerToken, archive, { accessControl: true, archive })
    })
    it('disallows anonymous access', async () => {
      await attemptRoute(archive, undefined, StatusCodes.UNAUTHORIZED)
    })
    it('allows owner access', async () => {
      await attemptRoute(archive, ownerToken)
    })
    it('disallows other user access', async () => {
      await attemptRoute(archive, otherUserToken, StatusCodes.FORBIDDEN)
    })
  })
})
