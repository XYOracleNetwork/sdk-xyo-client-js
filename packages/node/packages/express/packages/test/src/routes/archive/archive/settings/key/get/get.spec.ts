import { assertEx } from '@xylabs/assert'
import { StatusCodes } from 'http-status-codes'

import { claimArchive, createArchiveKey, getArchiveKeys, getTokenForUnitTestUser, request } from '../../../../../../testUtil'

describe('/archive/:archive/settings/key', () => {
  let token = ''
  let archive = ''
  beforeAll(async () => {
    token = await getTokenForUnitTestUser()
  })
  beforeEach(async () => {
    archive = (await claimArchive(token)).archive
  })
  describe('auth', () => {
    it('is required', async () => {
      await (await request()).get(`/archive/${archive}/settings/key`).expect(StatusCodes.UNAUTHORIZED)
    })
    it('supports JWT', async () => {
      await (await request()).get(`/archive/${archive}/settings/key`).auth(token, { type: 'bearer' }).expect(StatusCodes.OK)
    })
    it('supports API Key', async () => {
      const createKeyResponse = await createArchiveKey(token, archive)
      const key = assertEx(createKeyResponse?.[0]).key
      await (await request()).get(`/archive/${archive}/settings/key`).set('x-api-key', key).expect(StatusCodes.OK)
    })
  })
  it('Returns the keys for the archive', async () => {
    const createKeyResponse = await createArchiveKey(token, archive)
    const key = assertEx(createKeyResponse?.[0]).key
    const response = await getArchiveKeys(token, archive)
    expect(response.length).toEqual(1)
    expect(response[0].key).toEqual(key)
  })
  it('Returns any empty array if there are no keys for the archive', async () => {
    const response = await getArchiveKeys(token, archive)
    expect(response).toEqual([])
  })
})
