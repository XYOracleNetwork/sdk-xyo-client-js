import { delay } from '@xylabs/delay'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { claimArchive, getExistingUser, postCommandsToArchive, signInUser, TestWeb3User } from '@xyo-network/express-node-test'
import { DebugSchema, SetArchivePermissions, SetArchivePermissionsPayload, SetArchivePermissionsSchema } from '@xyo-network/node-core-model'
import { XyoPayloadBuilder } from '@xyo-network/payload-builder'
import { StatusCodes } from 'http-status-codes'

const allowedSchema = DebugSchema
const otherSchema = 'network.xyo.test'

const processingDelay = () => {
  // NOTE: May need to increase this time if
  // we start seeing intermittent failures of
  // these tests as we're waiting for the processing
  // of the archive permissions on the server side
  return delay(100)
}

type TestSchemaTypes = typeof allowedSchema | typeof otherSchema

const setArchivePermissions = (archive: string, token: string, permissions: SetArchivePermissions) => {
  const data: SetArchivePermissionsPayload = {
    ...permissions,
    schema: SetArchivePermissionsSchema,
  }
  const payload = new XyoPayloadBuilder<SetArchivePermissionsPayload>({ schema: SetArchivePermissionsSchema }).fields(data).build()
  const [bw] = new BoundWitnessBuilder({ inlinePayloads: true }).payload(payload).build()
  return postCommandsToArchive([bw], archive, token)
}

const postCommandToArchive = (
  archive: string,
  token?: string,
  schema: TestSchemaTypes = allowedSchema,
  expectedStatus: StatusCodes = StatusCodes.ACCEPTED,
) => {
  const data = {
    schema,
  }
  const payload = new XyoPayloadBuilder<{ schema: TestSchemaTypes }>({ schema }).fields(data).build()
  const [bw] = new BoundWitnessBuilder({ inlinePayloads: true }).payload(payload).build()
  return postCommandsToArchive([bw], archive, token, expectedStatus)
}

describe('ArchiveAccountStrategy', () => {
  let user: TestWeb3User
  let userToken: string
  let owner: TestWeb3User
  let ownerToken: string
  let archive: string
  beforeAll(async () => {
    owner = await getExistingUser()
    ownerToken = await signInUser(owner)
    user = await getExistingUser()
    userToken = await signInUser(user)
  })
  describe('with no archive permissions', () => {
    beforeAll(async () => {
      archive = (await claimArchive(ownerToken)).archive
      await processingDelay()
    })
    describe('allows', () => {
      it('owner', async () => {
        await postCommandToArchive(archive, ownerToken)
      })
      it('address', async () => {
        await postCommandToArchive(archive, userToken)
      })
      it('anonymous', async () => {
        await postCommandToArchive(archive)
      })
    })
  })
  describe('with archive permissions', () => {
    describe('for allowing address', () => {
      beforeAll(async () => {
        archive = (await claimArchive(ownerToken)).archive
        await setArchivePermissions(archive, ownerToken, {
          addresses: {
            allow: [user.address],
          },
          schema: SetArchivePermissionsSchema,
        })
        await processingDelay()
      })
      describe('allows address of', () => {
        it('owner', async () => {
          await postCommandToArchive(archive, ownerToken)
        })
        it('address in list', async () => {
          await postCommandToArchive(archive, userToken)
        })
      })
      describe('disallows address of', () => {
        it('user not in list', async () => {
          const other = await getExistingUser()
          const otherToken = await signInUser(other)
          await postCommandToArchive(archive, otherToken, allowedSchema, StatusCodes.FORBIDDEN)
        })
        it('anonymous', async () => {
          await postCommandToArchive(archive, undefined, allowedSchema, StatusCodes.UNAUTHORIZED)
        })
      })
    })
    describe('for allowing schema', () => {
      beforeAll(async () => {
        archive = (await claimArchive(ownerToken)).archive
        await setArchivePermissions(archive, ownerToken, {
          schema: SetArchivePermissionsSchema,
          schemas: {
            allow: [allowedSchema],
          },
        })
        await processingDelay()
      })
      describe('allows schema', () => {
        it('in list', async () => {
          await postCommandToArchive(archive, ownerToken)
        })
        it('not in list for owner', async () => {
          await postCommandToArchive(archive, ownerToken, otherSchema)
        })
      })
      describe('disallows schema', () => {
        it('not in list', async () => {
          await postCommandToArchive(archive, userToken, otherSchema, StatusCodes.FORBIDDEN)
        })
      })
    })
    describe('for rejecting address', () => {
      beforeAll(async () => {
        archive = (await claimArchive(ownerToken)).archive
        await setArchivePermissions(archive, ownerToken, {
          addresses: {
            reject: [user.address],
          },
          schema: SetArchivePermissionsSchema,
        })
        await processingDelay()
      })
      describe('allows', () => {
        it('owner', async () => {
          await postCommandToArchive(archive, ownerToken)
        })
        it('address not in disallowed list', async () => {
          const otherUser = await getExistingUser()
          const otherToken = await signInUser(otherUser)
          await postCommandToArchive(archive, otherToken)
        })
      })
      describe('disallows', () => {
        it('address in disallowed list', async () => {
          await postCommandToArchive(archive, userToken, allowedSchema, StatusCodes.FORBIDDEN)
        })
        it('anonymous', async () => {
          await postCommandToArchive(archive, undefined, allowedSchema, StatusCodes.UNAUTHORIZED)
        })
      })
    })
    describe('for rejecting schema', () => {
      beforeAll(async () => {
        archive = (await claimArchive(ownerToken)).archive
        await setArchivePermissions(archive, ownerToken, {
          schema: SetArchivePermissionsSchema,
          schemas: {
            reject: [otherSchema],
          },
        })
        await processingDelay()
      })
      describe('allows', () => {
        it('owner to perform schema in disallowed list', async () => {
          await postCommandToArchive(archive, ownerToken, otherSchema)
        })
        it('schema not in disallowed list', async () => {
          await postCommandToArchive(archive, userToken)
        })
      })
      describe('disallows', () => {
        it('schema in disallowed list', async () => {
          await postCommandToArchive(archive, userToken, otherSchema, StatusCodes.FORBIDDEN)
        })
      })
    })
  })
})
