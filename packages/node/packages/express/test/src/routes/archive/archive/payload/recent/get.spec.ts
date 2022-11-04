import { XyoPayloadWithMeta } from '@xyo-network/node-core-model'

import { claimArchive, getBlockWithPayloads, getRecentPayloads, getTokenForUnitTestUser, postBlock } from '../../../../../testUtil'

const defaultReturnLength = 20

const getRecent = async (archive: string, token: string, expectedReturnLength = defaultReturnLength): Promise<XyoPayloadWithMeta[]> => {
  const recent = await getRecentPayloads(archive, token)
  expect(recent).toBeTruthy()
  expect(Array.isArray(recent)).toBe(true)
  expect(recent.length).toBe(expectedReturnLength)
  return recent
}

describe('/archive/:archive/payload/recent/:limit', () => {
  const payloadsToPost = defaultReturnLength + 5
  const otherPayloadsToPost = Math.ceil(defaultReturnLength / 2)
  let token = ''
  let archive = ''
  let otherArchive = ''
  beforeAll(async () => {
    token = await getTokenForUnitTestUser()
    archive = (await claimArchive(token)).archive
    otherArchive = (await claimArchive(token)).archive
    // POST Payloads to test archive
    for (let i = 0; i < payloadsToPost; i++) {
      const response = await postBlock(getBlockWithPayloads(1), archive)
      expect(response.length).toBe(1)
    }
    // POST some payloads to another archive
    for (let i = 0; i < otherPayloadsToPost; i++) {
      const response = await postBlock(getBlockWithPayloads(1), otherArchive)
      expect(response.length).toBe(1)
    }
  }, 1000 * (payloadsToPost + otherPayloadsToPost))
  it(`With no argument, retrieves the ${defaultReturnLength} most recently posted payloads`, async () => {
    // Ensure the original payloads only show up when getting recent from that archive
    const recent = await getRecent(archive, token)
    recent.map((block) => expect(block._archive).toBe(archive))
  })
  it('Only retrieves recently posted payloads from the archive specified in the path', async () => {
    // Ensure the new payloads only show up when getting recent from that archive
    const recent = await getRecent(otherArchive, token, otherPayloadsToPost)
    recent.map((block) => expect(block._archive).toBe(otherArchive))
  })
  it('When no payloads have been posted to the archive, returns an empty array', async () => {
    await getRecent((await claimArchive(token)).archive, token, 0)
  })
})
