import { assertEx } from '@xylabs/assert'
import { claimArchive, createArchiveKey, getTokenForUnitTestUser, request } from '@xyo-network/express-node-test'
import { StatusCodes } from 'http-status-codes'

describe('archiveApiKeyStrategy', () => {
  let token = ''
  let archive = ''
  let key = ''
  beforeAll(async () => {
    token = await getTokenForUnitTestUser()
    archive = (await claimArchive(token)).archive
    const createKeyResponse = await createArchiveKey(token, archive)
    expect(createKeyResponse).toBeTruthy()
    expect(createKeyResponse).toBeArrayOfSize(1)
    expect(createKeyResponse?.[0]?.key).toBeString()
    key = assertEx(createKeyResponse?.[0]).key
  })
  describe('for archive with key', () => {
    it('allows API access using API key', async () => {
      await (await request()).get(`/archive/${archive}/settings/key`).set('x-api-key', key).expect(StatusCodes.OK)
    })
  })
  describe('for archive without key', () => {
    it('disallows API access using API key', async () => {
      const archive = (await claimArchive(token)).archive
      await (await request()).get(`/archive/${archive}/settings/key`).set('x-api-key', key).expect(StatusCodes.UNAUTHORIZED)
    })
  })
  describe('for routes that do not require auth', () => {
    it('allows access without auth', async () => {
      await (await request()).get('/archive').expect(StatusCodes.OK)
    })
    it('allows access with valid API key', async () => {
      await (await request()).get('/archive').set('x-api-key', key).expect(StatusCodes.OK)
    })
    it('disallows access with invalid API key', async () => {
      const key = 'foo'
      await (await request()).get('/archive').set('x-api-key', key).expect(StatusCodes.UNAUTHORIZED)
    })
  })
})
