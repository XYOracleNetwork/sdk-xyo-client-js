import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'

import { testPayload } from '../../Test'
import { getApi, getNewArchive } from '../ApiUtil.spec'

describe('XyoArchivistArchiveBlockApi', () => {
  const api = getApi()
  describe('post', function () {
    it.each([true, false])('posts a single bound witness', async (inlinePayloads) => {
      const builder = new BoundWitnessBuilder({ inlinePayloads }).payload(testPayload)
      const [bw] = builder.build()
      const blocks = [bw]
      const response = await api.archives.archive().block.post(blocks)
      expect(response?.length).toEqual(blocks.length)
    })
    it.each([true, false])('posts multiple bound witnesses', async (inlinePayloads) => {
      const builder = new BoundWitnessBuilder({ inlinePayloads }).payload(testPayload)
      const [bw] = builder.build()
      const blocks = [bw, bw]
      const response = await api.archives.archive().block.post(blocks)
      expect(response?.length).toEqual(blocks.length)
    })
  })
  describe('stats', () => {
    const [bw] = new BoundWitnessBuilder().build()
    const blocks = [bw]
    let archive = ''
    beforeEach(async () => {
      archive = await getNewArchive(api)
    })
    it('returns stats for boundwitness', async () => {
      await api.archives.archive(archive).block.post(blocks)
      const stats = await api.archives.archive(archive).block.stats.get()
      expect(stats?.count).toBeGreaterThanOrEqual(blocks.length)
    })
  })
  describe('find', () => {
    const [bw] = new BoundWitnessBuilder().build()
    const blocks = [bw]
    let archive = ''
    beforeEach(async () => {
      archive = await getNewArchive(api)
    })
    it('returns bound witnesses from before the timestamp', async () => {
      const timestamp = Date.now() - 10000
      await api.archives.archive(archive).block.post(blocks)
      const response = await api.archives.archive(archive).block.find({ order: 'asc', timestamp })
      expect(response?.length).toBe(blocks.length)
    })
    it('returns bound witnesses from after the timestamp', async () => {
      await api.archives.archive(archive).block.post(blocks)
      const timestamp = Date.now() + 10000
      const response = await api.archives.archive(archive).block.find({ order: 'desc', timestamp })
      expect(response?.length).toBe(blocks.length)
    })
  })
})
