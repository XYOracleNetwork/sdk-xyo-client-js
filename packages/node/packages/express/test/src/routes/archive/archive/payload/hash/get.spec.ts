import {
  claimArchive,
  getPayloadByHash,
  getTokenForOtherUnitTestUser,
  getTokenForUnitTestUser,
  knownBlock,
  knownPayloadHash,
  postBlock,
} from '../../../../../testUtil'

describe('/archive/:archive/block/payload/:hash', () => {
  let token = ''
  let archive = ''
  beforeAll(async () => {
    token = await getTokenForUnitTestUser()
  })
  beforeEach(async () => {
    archive = (await claimArchive(token)).archive
    await postBlock(knownBlock, archive)
  })
  it('Retrieves previously posted payloads by hash', async () => {
    const response = await getPayloadByHash(token, archive, knownPayloadHash)
    expect(response).toBeTruthy()
    expect(response.length).toBe(1)
    const block = response[0]
    expect(block).toBeTruthy()
    expect(block._user_agent).toBe(undefined)
  })
  it('Allows retrieving the same payload if posted to multiple archives', async () => {
    const response = await getPayloadByHash(token, archive, knownPayloadHash)
    expect(response.length).toBe(1)
    const token2 = await getTokenForOtherUnitTestUser()
    const archive2 = (await claimArchive(token2)).archive
    await postBlock(knownBlock, archive2)
    const response2 = await getPayloadByHash(token2, archive2, knownPayloadHash)
    expect(response2.length).toBe(1)
  })
})
