import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'

import { testPayload } from '../../../Test'
import { getApi } from '../../ApiUtil.spec'

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
})
