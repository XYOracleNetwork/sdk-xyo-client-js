import {
  claimArchive,
  getArchiveName,
  getBlock,
  getBlocks,
  getBlocksWithPayloads,
  getBlockWithPayloads,
  getPayloads,
  getTokenForUnitTestUser,
  postBlock,
} from '../../../../../testUtil'

describe('/archive/:archive/block', () => {
  describe('allows posting block', () => {
    let token = ''
    let archive = ''
    beforeAll(async () => {
      token = await getTokenForUnitTestUser()
      archive = (await claimArchive(token)).archive
    })
    it('to existing archive', async () => {
      await postBlock(getBlock(), archive)
    })
    it('to non-existing archives', async () => {
      await postBlock(getBlock(), getArchiveName())
    })
    it('with single payload', async () => {
      const response = await postBlock(getBlockWithPayloads(1), archive)
      expect(response.length).toEqual(1)
    })
    it('with multiple payloads', async () => {
      const response = await postBlock(getBlockWithPayloads(2), archive)
      expect(response.length).toEqual(1)
    })
    it('without payloads', async () => {
      const response = await postBlock(getBlock(), archive)
      expect(response.length).toEqual(1)
    })
    it('with multiple bound witnesses', async () => {
      const response = await postBlock(getBlocks(2), archive)
      expect(response.length).toEqual(2)
    })
    it('with multiple bound witnesses with payloads', async () => {
      const response = await postBlock(getBlocksWithPayloads(2), archive)
      expect(response.length).toEqual(2)
    })
    it('with multiple bound witnesses with multiple payloads', async () => {
      const response = await postBlock(getBlocksWithPayloads(2, 2), archive)
      expect(response.length).toEqual(2)
    })
    it('with multiple bound witnesses some with payloads and some without', async () => {
      const boundWitness1 = getBlock(...getPayloads(2))
      const boundWitness2 = getBlock()
      const block = [boundWitness1, boundWitness2]
      const response = await postBlock(block, archive)
      expect(response.length).toEqual(2)
    })
  })
})
