import { assertEx } from '@xylabs/assert'
import { delay } from '@xylabs/delay'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { DebugPayloadWithMeta, DebugSchema } from '@xyo-network/node-core-model'
import { XyoPayloadBuilder } from '@xyo-network/payload'
import { XyoPayload } from '@xyo-network/payload-model'
import { StatusCodes } from 'http-status-codes'
import { v4 } from 'uuid'

import { claimArchive, getTokenForUnitTestUser, postCommandsToArchive, queryCommandResult, request } from '../../../testUtil'

const schema = DebugSchema

const getTestRequest = (delay = 1): XyoPayload => {
  const fields = { delay, nonce: v4() }
  return new XyoPayloadBuilder<DebugPayloadWithMeta>({ schema }).fields(fields).build()
}

const postRequest = async (delay = 1, archive = 'temp', token?: string): Promise<string> => {
  const payload = getTestRequest(delay)
  const [bw] = new BoundWitnessBuilder({ inlinePayloads: true }).payload(payload).build()
  const result = await postCommandsToArchive([bw], archive, token)
  const id = result?.[0]?.[0]
  expect(id).toBeDefined()
  return assertEx(id)
}

describe('/query/:hash', () => {
  let token: string
  let archive: string
  beforeAll(async () => {
    token = await getTokenForUnitTestUser()
    archive = (await claimArchive(token)).archive
  })
  let id: string
  describe('for processing query', () => {
    beforeEach(async () => {
      id = await postRequest(10000, archive, token)
      await delay(100)
    })
    it('returns accepted', async () => {
      await (await request()).get(`/query/${id}`).expect(StatusCodes.ACCEPTED)
    })
  })
  describe('for non-existent query', () => {
    beforeEach(() => {
      id = 'foo'
    })
    // NOTE: Skipping because we're running in-memory query processing and
    // we'll get mixed results until we use distributed state/transport
    it.skip('returns not found', async () => {
      await (await request()).get(`/query/${id}`).expect(StatusCodes.NOT_FOUND)
    })
  })
  describe('for completed query', () => {
    beforeEach(async () => {
      id = await postRequest()
      expect(id).toBeTruthy()
      await delay(1000)
    })
    it('redirects to HURI', async () => {
      await (await request()).get(`/query/${id}`).expect(StatusCodes.MOVED_TEMPORARILY)
    })
    it('returns query answer', async () => {
      const result = await queryCommandResult(id, token, StatusCodes.OK)
      expect(result).toBeTruthy()
      expect(result.schema).toBe(schema)
    })
  })
})
