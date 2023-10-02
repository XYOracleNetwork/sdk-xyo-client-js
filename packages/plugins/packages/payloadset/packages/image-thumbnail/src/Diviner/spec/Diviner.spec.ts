import { HDWallet } from '@xyo-network/account'
import { MemoryBoundWitnessDiviner } from '@xyo-network/diviner-boundwitness-memory'
import { MemoryPayloadDiviner } from '@xyo-network/diviner-payload-memory'
import { MemoryArchivist } from '@xyo-network/memory-archivist'
import { MemoryNode } from '@xyo-network/node-memory'
import { UrlPayload, UrlSchema } from '@xyo-network/url-payload-plugin'

import { SearchableStorage } from '../Config'
import { ImageThumbnailDiviner } from '../Diviner'

describe('ImageThumbnailDiviner', () => {
  const indexArchivistName = 'indexArchivist'
  const stateArchivistName = 'stateArchivist'
  const thumbnailArchivistName = 'thumbnailArchivist'

  let node: MemoryNode
  let diviner: ImageThumbnailDiviner

  beforeAll(async () => {
    const thumbnailArchivist = await MemoryArchivist.create({
      config: { name: thumbnailArchivistName, schema: MemoryArchivist.configSchema },
      wallet: await HDWallet.random(),
    })
    const thumbnailBoundWitnessDiviner = await MemoryBoundWitnessDiviner.create({
      config: { archivist: thumbnailArchivistName, schema: MemoryBoundWitnessDiviner.configSchema },
      wallet: await HDWallet.random(),
    })
    const thumbnailPayloadDiviner = await MemoryPayloadDiviner.create({
      config: { archivist: thumbnailArchivistName, schema: MemoryPayloadDiviner.configSchema },
      wallet: await HDWallet.random(),
    })
    const thumbnailStore: SearchableStorage = {
      archivist: thumbnailArchivist.address,
      boundWitnessDiviner: thumbnailBoundWitnessDiviner.address,
      payloadDiviner: thumbnailPayloadDiviner.address,
    }

    const indexArchivist = await MemoryArchivist.create({
      config: { name: indexArchivistName, schema: MemoryArchivist.configSchema },
      wallet: await HDWallet.random(),
    })
    const indexBoundWitnessDiviner = await MemoryBoundWitnessDiviner.create({
      config: { archivist: indexArchivistName, schema: MemoryBoundWitnessDiviner.configSchema },
      wallet: await HDWallet.random(),
    })
    const indexPayloadDiviner = await MemoryPayloadDiviner.create({
      config: { archivist: indexArchivistName, schema: MemoryPayloadDiviner.configSchema },
      wallet: await HDWallet.random(),
    })
    const indexStore: SearchableStorage = {
      archivist: indexArchivist.address,
      boundWitnessDiviner: indexBoundWitnessDiviner.address,
      payloadDiviner: indexPayloadDiviner.address,
    }

    const stateArchivist = await MemoryArchivist.create({
      config: { name: stateArchivistName, schema: MemoryArchivist.configSchema },
      wallet: await HDWallet.random(),
    })
    const stateBoundWitnessDiviner = await MemoryBoundWitnessDiviner.create({
      config: { archivist: stateArchivistName, schema: MemoryBoundWitnessDiviner.configSchema },
      wallet: await HDWallet.random(),
    })
    const statePayloadDiviner = await MemoryPayloadDiviner.create({
      config: { archivist: stateArchivistName, schema: MemoryPayloadDiviner.configSchema },
      wallet: await HDWallet.random(),
    })
    const stateStore: SearchableStorage = {
      archivist: stateArchivist.address,
      boundWitnessDiviner: stateBoundWitnessDiviner.address,
      payloadDiviner: statePayloadDiviner.address,
    }

    diviner = await ImageThumbnailDiviner.create({
      config: { indexStore, pollFrequency: 1, schema: ImageThumbnailDiviner.configSchema, stateStore, thumbnailStore },
      wallet: await HDWallet.random(),
    })
    const modules = [
      stateArchivist,
      stateBoundWitnessDiviner,
      statePayloadDiviner,
      indexArchivist,
      indexBoundWitnessDiviner,
      indexPayloadDiviner,
      thumbnailArchivist,
      thumbnailBoundWitnessDiviner,
      thumbnailPayloadDiviner,
      diviner,
    ]
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
  describe('with no thumbnail for the provided URL', () => {
    it('returns nothing', async () => {
      expect(diviner).toBeDefined()
      const url = 'https://xyo.network'
      const schema = UrlSchema
      const payload: UrlPayload = { schema, url }
      const result = await diviner.divine([payload])
      expect(result).toBeArrayOfSize(0)
    })
  })
})
