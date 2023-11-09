import { Account } from '@xyo-network/account'
import { isImageThumbnail } from '@xyo-network/image-thumbnail-payload-plugin'
import { MemoryArchivist } from '@xyo-network/memory-archivist'
import { MemoryNode } from '@xyo-network/node-memory'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { MemorySentinel, SentinelWrapper } from '@xyo-network/sentinel'
import { UrlSchema } from '@xyo-network/url-payload-plugin'
import { isTimestamp, TimestampWitness } from '@xyo-network/witness-timestamp'
import { mock } from 'jest-mock-extended'

import { ImageThumbnailWitness } from '../Witness'

/**
 * @group thumbnail
 * @group sentinel
 */

describe('Witness', () => {
  describe('when behind sentinel', () => {
    const archivistName = 'archivist'
    let thumbnailWitness: ImageThumbnailWitness
    let timestampWitness: TimestampWitness
    let archivist: MemoryArchivist
    let sentinel: MemorySentinel
    let node: MemoryNode
    const logger = mock<Console>()

    beforeAll(async () => {
      thumbnailWitness = await ImageThumbnailWitness.create({
        account: Account.randomSync(),
        config: { schema: ImageThumbnailWitness.configSchema },
        logger,
      })
      timestampWitness = await TimestampWitness.create({
        account: Account.randomSync(),
        config: { schema: TimestampWitness.configSchema },
        logger,
      })
      archivist = await MemoryArchivist.create({
        account: Account.randomSync(),
        config: { name: archivistName, schema: MemoryArchivist.configSchema },
      })
      sentinel = await MemorySentinel.create({
        account: Account.randomSync(),
        config: {
          archiving: { archivists: [archivistName] },
          schema: MemorySentinel.configSchema,
          synchronous: true,
          tasks: [{ input: true, module: thumbnailWitness.address }, { module: timestampWitness.address }],
        },
        logger,
      })
      const modules = [timestampWitness, thumbnailWitness, archivist, sentinel]
      node = await MemoryNode.create({
        account: Account.randomSync(),
        config: { schema: MemoryNode.configSchema },
        logger,
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
      // TODO: Replace with data url for speed
      // const url =
      //   "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><circle cx='50' cy='50' r='48' fill='yellow' stroke='black' stroke-width='2'/><circle cx='35' cy='35' r='5' fill='black'/><circle cx='65' cy='35' r='5' fill='black'/><path d='M 35 70 Q 50 85, 65 70' fill='none' stroke='black' stroke-width='2'/></svg>"
      const url = 'https://placekitten.com/200/300'
      const query = new PayloadBuilder({ schema: UrlSchema }).fields({ url }).build()
      const sentinelWrapper = SentinelWrapper.wrap(sentinel, Account.randomSync())
      //using wrapper for archiving
      const values = await sentinelWrapper.report([query])
      const timestamps = values.filter(isTimestamp)
      expect(timestamps.length).toBe(1)
      const thumbnails = values.filter(isImageThumbnail)
      expect(thumbnails.length).toBe(1)
      const thumbnail = thumbnails[0]
      expect(thumbnail.sourceUrl).toBe(url)
      const payloads = await archivist?.all()
      expect(payloads?.length).toBeGreaterThan(0)
    })
  })
})
