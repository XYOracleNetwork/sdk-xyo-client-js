import { ForgetPromise } from '@xylabs/forget'
import { XyoArchive } from '@xyo-network/api'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness'
import { DebugPayload, DebugSchema, SetArchivePermissionsPayload } from '@xyo-network/node-core-model'
import { XyoPayloadBuilder } from '@xyo-network/payload'
import { StatusCodes } from 'http-status-codes'

import {
  claimArchive,
  getTokenForOtherUnitTestUser,
  getTokenForUnitTestUser,
  postCommandsToArchive,
  request,
  setArchiveAccessControl,
} from '../../../../../testUtil'

interface MigrationResponse {
  archive: XyoArchive
  migrated: SetArchivePermissionsPayload
}

const schema = DebugSchema

const postCommandToArchive = async (archive: string, token?: string, expectedStatus: StatusCodes = StatusCodes.ACCEPTED) => {
  const payload = new XyoPayloadBuilder<DebugPayload>({ schema }).build()
  const [bw] = new BoundWitnessBuilder({ inlinePayloads: true }).payload(payload).build()
  await postCommandsToArchive([bw], archive, token, expectedStatus)
}

const migrateArchive = async (archive: string): Promise<MigrationResponse> => {
  const path = `/management/migrate/permissions/archives/${archive}`
  const header = { 'x-api-key': process.env.API_KEY }
  const response = await (await request()).post(path).set(header).expect(StatusCodes.OK)
  const result: MigrationResponse = response.body.data
  expect(result).toBeDefined()
  expect(result.archive).toBeDefined()
  expect(result.archive.archive).toBe(archive)
  expect(result).toBeDefined()
  expect(result.migrated).toBeDefined()
  expect(result.migrated?.schemas).toBeUndefined()
  return result
}

describe('/management/migrate/permissions/archives/:archive', () => {
  let ownerToken: string
  let otherUserToken: string
  let archive: XyoArchive
  beforeAll(async () => {
    ownerToken = await getTokenForUnitTestUser()
    otherUserToken = await getTokenForOtherUnitTestUser()
  })
  describe('with public archive', () => {
    beforeAll(async () => {
      archive = await claimArchive(ownerToken)
      const result = await migrateArchive(archive.archive)
      expect(result.migrated?.addresses).toBeUndefined()
      expect(result.migrated?.schemas).toBeUndefined()
    })
    it('allows owner archive access', async () => {
      await postCommandToArchive(archive.archive, ownerToken)
    })
    it('allows another user archive access', async () => {
      await postCommandToArchive(archive.archive, otherUserToken)
    })
    it('allows anonymous archive access', async () => {
      await postCommandToArchive(archive.archive, undefined)
    })
  })
  describe('with private archive', () => {
    beforeAll(async () => {
      archive = await claimArchive(ownerToken)
      archive.accessControl = true
      await setArchiveAccessControl(ownerToken, archive.archive, archive)
      const result = await migrateArchive(archive.archive)
      expect(result.migrated?.addresses?.allow).toEqual([])
      expect(result.migrated?.schemas).toBeUndefined()
    })
    it('allows owner archive access', async () => {
      await postCommandToArchive(archive.archive, ownerToken)
    })
    it('disallows another user archive access', async () => {
      await postCommandToArchive(archive.archive, otherUserToken, StatusCodes.FORBIDDEN)
    })
    it('disallows anonymous archive access', async () => {
      await postCommandToArchive(archive.archive, undefined, StatusCodes.UNAUTHORIZED)
    })
  })
  afterAll(async () => {
    await ForgetPromise.awaitInactive()
  })
})
