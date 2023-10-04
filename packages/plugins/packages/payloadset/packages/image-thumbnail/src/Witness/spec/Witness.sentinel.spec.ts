import { HDWallet } from '@xyo-network/account'
import { isImageThumbnail } from '@xyo-network/image-thumbnail-payload-plugin'
import { MemoryNode } from '@xyo-network/node-memory'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { MemorySentinel } from '@xyo-network/sentinel'
import { UrlSchema } from '@xyo-network/url-payload-plugin'
import { isTimestamp, TimestampWitness } from '@xyo-network/witness-timestamp'
import { mock, MockProxy } from 'jest-mock-extended'

import { ImageThumbnailWitness } from '../Witness'

describe('Witness', () => {
  describe('when behind sentinel', () => {
    let thumbnailWitness: ImageThumbnailWitness
    let timestampWitness: TimestampWitness
    let sentinel: MemorySentinel
    let node: MemoryNode
    const logger = mock<Console>()

    beforeAll(async () => {
      thumbnailWitness = await ImageThumbnailWitness.create({
        config: { schema: ImageThumbnailWitness.configSchema },
        logger,
        wallet: await HDWallet.random(),
      })
      timestampWitness = await TimestampWitness.create({
        config: { schema: TimestampWitness.configSchema },
        logger,
        wallet: await HDWallet.random(),
      })
      sentinel = await MemorySentinel.create({
        config: { schema: MemorySentinel.configSchema },
        logger,
        wallet: await HDWallet.random(),
      })
      const modules = [timestampWitness, thumbnailWitness, sentinel]
      node = await MemoryNode.create({
        config: { schema: MemoryNode.configSchema },
        logger,
        wallet: await HDWallet.random(),
      })
      await node.start()
      await Promise.all(
        modules.map(async (mod) => {
          await node.register(mod)
          await node.attach(mod.address, true)
        }),
      )
    })
    it('witnesses thumbnail for url', async () => {
      // const url =
      //   'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="20" height="20" viewBox="0 0 20 20" fill="%23000000"><path d="M9 6v5h.06l2.48 2.47 1.41-1.41L11 10.11V6z"/><path d="M10 1a9 9 0 00-7.85 13.35L.5 16H6v-5.5l-2.38 2.38A7 7 0 1110 17v2a9 9 0 000-18z"/></svg>'
      const url = 'https://placekitten.com/200/300'
      const query = new PayloadBuilder({ schema: UrlSchema }).fields({ url }).build()
      const values = await sentinel.report([query])
      const timestamps = values.filter(isTimestamp)
      expect(timestamps.length).toBe(1)
      const thumbnails = values.filter(isImageThumbnail)
      expect(thumbnails.length).toBe(1)
      const thumbnail = thumbnails[0]
      expect(thumbnail.sourceUrl).toBe(url)
    })
  })
})
