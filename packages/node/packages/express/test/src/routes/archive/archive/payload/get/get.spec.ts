import { SortDirection, XyoPayloadWithMeta } from '@xyo-network/node-core-model'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'

import {
  claimArchive,
  getArchiveName,
  getBlock,
  getPayload,
  getPayloadsByTimestamp,
  getTokenForUnitTestUser,
  postBlock,
  request,
} from '../../../../../testUtil'

const sortDirections: SortDirection[] = ['asc', 'desc']

describe('/archive/:archive/payload', () => {
  let token = ''
  let archive = ''
  const startTime = Date.now() - 1
  beforeAll(async () => {
    token = await getTokenForUnitTestUser()
    archive = getArchiveName()
    await claimArchive(token, archive)
    const blocksPosted = 15
    for (let blockCount = 0; blockCount < blocksPosted; blockCount++) {
      const payload = getPayload()
      payload.timestamp = Date.now()
      const block = getBlock(payload)
      const blockResponse = await postBlock(block, archive)
      expect(blockResponse.length).toBe(1)
    }
  })
  it(`With missing timestamp returns ${ReasonPhrases.OK}`, async () => {
    await (await request()).get(`/archive/${archive}/block`).query({ limit: 10, order: 'asc' }).auth(token, { type: 'bearer' }).expect(StatusCodes.OK)
  })
  describe('With valid data', () => {
    describe.each(sortDirections)('In %s order', (order: SortDirection) => {
      let response: XyoPayloadWithMeta[] = []
      let time: number = Date.now()
      beforeEach(async () => {
        time = order === 'asc' ? startTime : Date.now()
        response = await getPayloadsByTimestamp(token, archive, time, 10, order)
        expect(response).toBeTruthy()
        expect(Array.isArray(response)).toBe(true)
        expect(response.length).toBe(10)
      })
      it('Returns blocks not including the specified timestamp', () => {
        expect(response.map((x) => x.timestamp)).not.toContain(time)
      })
      it('Returns blocks in the correct sort order', () => {
        expect(response).toBeSortedBy('timestamp', { descending: order === 'desc' })
      })
    })
  })
})
