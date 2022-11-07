import {
  claimArchive,
  getBlockByHash,
  getTokenForOtherUnitTestUser,
  getTokenForUnitTestUser,
  knownBlock,
  knownBlockHash,
  postBlock,
} from '../../../../../testUtil'

describe('/archive/:archive/block/hash/:hash', () => {
  let token = ''
  let archive = ''
  beforeAll(async () => {
    token = await getTokenForUnitTestUser()
  })
  beforeEach(async () => {
    archive = (await claimArchive(token)).archive
    await postBlock(knownBlock, archive)
  })
  it('Retrieves previously posted blocks by hash', async () => {
    const response = await getBlockByHash(token, archive, knownBlockHash)
    expect(response).toBeTruthy()
    expect(response.length).toBe(1)
    const block = response[0]
    expect(block).toBeTruthy()
  })
  it('Allows retrieving the same block if posted to multiple archives', async () => {
    const response = await getBlockByHash(token, archive, knownBlockHash)
    expect(response.length).toBe(1)
    const token2 = await getTokenForOtherUnitTestUser()
    const archive2 = (await claimArchive(token2)).archive
    await postBlock(knownBlock, archive2)
    const response2 = await getBlockByHash(token2, archive2, knownBlockHash)
    expect(response2.length).toBe(1)
  })
})
