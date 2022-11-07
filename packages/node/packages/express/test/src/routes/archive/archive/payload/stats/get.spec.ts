import { delay } from '@xylabs/delay'
import { StatusCodes } from 'http-status-codes'

import { claimArchive, getBlockWithPayloads, getTokenForUnitTestUser, postBlock, request } from '../../../../../testUtil'

const count = 5

describe('/archive/:archive/payload/stats', () => {
  let token = ''
  let archive = ''
  let otherArchive = ''
  beforeAll(async () => {
    // Post blocks to two different archives
    token = await getTokenForUnitTestUser()
    archive = (await claimArchive(token)).archive
    otherArchive = (await claimArchive(token)).archive

    // NOTE: POST in parallel to speed up test
    const posted = [
      // POST Payloads to test archive
      new Array(count).fill(null).map(async () => {
        const response = await postBlock(getBlockWithPayloads(), archive)
        expect(response.length).toBe(1)
      }),
      // Post some payloads to another archive
      new Array(count).fill(null).map(async () => {
        const response = await postBlock(getBlockWithPayloads(), otherArchive)
        expect(response.length).toBe(1)
      }),
    ]
    await Promise.all(posted.flatMap((p) => p))
    // Allow counts to stabilize
    await delay(1000)
  })
  it('Returns stats on the desired archive', async () => {
    const response = await (await request()).get(`/archive/${archive}/payload/stats`).expect(StatusCodes.OK)
    const recent = response.body.data
    expect(recent).toBeTruthy()
    expect(recent?.count).toBeNumber()
    expect(recent.count).toBe(count)
  })
})
