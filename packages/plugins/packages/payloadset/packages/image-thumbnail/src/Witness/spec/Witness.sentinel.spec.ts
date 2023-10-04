import { HDWallet } from '@xyo-network/account'
import { MemoryNode } from '@xyo-network/node-memory'
import { MemorySentinel } from '@xyo-network/sentinel'
import { TimestampWitness } from '@xyo-network/witness-timestamp'

import { ImageThumbnailWitness } from '../Witness'

describe('Witness', () => {
  describe('when behind sentinel', () => {
    let thumbnailWitness: ImageThumbnailWitness
    let timestampWitness: TimestampWitness
    let sentinel: MemorySentinel
    let node: MemoryNode
    beforeAll(async () => {
      thumbnailWitness = await ImageThumbnailWitness.create({
        config: { schema: ImageThumbnailWitness.configSchema },
        wallet: await HDWallet.random(),
      })
      timestampWitness = await TimestampWitness.create({
        config: { schema: TimestampWitness.configSchema },
        wallet: await HDWallet.random(),
      })
      sentinel = await MemorySentinel.create({
        config: { schema: MemorySentinel.configSchema },
        wallet: await HDWallet.random(),
      })
      const modules = [timestampWitness, thumbnailWitness, sentinel]
      node = await MemoryNode.create({
        config: { schema: MemoryNode.configSchema },
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
    it('witnesses thumbnail for url', async () => {})
  })
})
