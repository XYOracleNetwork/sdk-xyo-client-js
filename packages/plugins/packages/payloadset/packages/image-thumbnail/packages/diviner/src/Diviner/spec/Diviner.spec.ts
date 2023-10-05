import { delay } from '@xylabs/delay'
import { HDWallet } from '@xyo-network/account'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { PayloadHasher } from '@xyo-network/core'
import { MemoryBoundWitnessDiviner } from '@xyo-network/diviner-boundwitness-memory'
import { MemoryPayloadDiviner } from '@xyo-network/diviner-payload-memory'
import { ImageThumbnailDivinerQuery, ImageThumbnailDivinerQuerySchema, SearchableStorage } from '@xyo-network/image-thumbnail-payload-plugin'
import { MemoryArchivist } from '@xyo-network/memory-archivist'
import { MemoryNode } from '@xyo-network/node-memory'
import { TimeStamp, TimestampSchema } from '@xyo-network/witness-timestamp'

import { ImageThumbnailDiviner } from '../Diviner'

describe('ImageThumbnailDiviner', () => {
  const indexArchivistName = 'indexArchivist'
  const stateArchivistName = 'stateArchivist'
  const thumbnailArchivistName = 'thumbnailArchivist'
  const sourceUrl = 'https://placekitten.com/200/300'
  const thumbnailHttpSuccess = {
    http: {
      status: 200,
    },
    schema: 'network.xyo.image.thumbnail',
    sourceHash: '7f39363514d9d9b958a5a993edeba35cb44f912c7072ed9ddd628728ac0fd681',
    sourceUrl,
    url: 'data:image/png;base64,===',
  }

  const thumbnailHttpFail = {
    http: {
      ipAddress: '104.17.96.13',
      status: 429,
    },
    schema: 'network.xyo.image.thumbnail',
    sourceUrl,
  }

  const thumbnailWitnessFail = {
    http: {
      ipAddress: '104.17.96.13',
    },
    schema: 'network.xyo.image.thumbnail',
    sourceUrl,
  }

  let sut: ImageThumbnailDiviner
  let node: MemoryNode

  let indexArchivist: MemoryArchivist
  let indexBoundWitnessDiviner: MemoryBoundWitnessDiviner
  let indexPayloadDiviner: MemoryPayloadDiviner

  let stateArchivist: MemoryArchivist
  let stateBoundWitnessDiviner: MemoryBoundWitnessDiviner
  let statePayloadDiviner: MemoryPayloadDiviner

  let thumbnailArchivist: MemoryArchivist
  let thumbnailBoundWitnessDiviner: MemoryBoundWitnessDiviner
  let thumbnailPayloadDiviner: MemoryPayloadDiviner

  beforeAll(async () => {
    // Create thumbnail store
    thumbnailArchivist = await MemoryArchivist.create({
      config: { name: thumbnailArchivistName, schema: MemoryArchivist.configSchema },
      wallet: await HDWallet.random(),
    })
    thumbnailBoundWitnessDiviner = await MemoryBoundWitnessDiviner.create({
      config: { archivist: thumbnailArchivistName, schema: MemoryBoundWitnessDiviner.configSchema },
      wallet: await HDWallet.random(),
    })
    thumbnailPayloadDiviner = await MemoryPayloadDiviner.create({
      config: { archivist: thumbnailArchivistName, schema: MemoryPayloadDiviner.configSchema },
      wallet: await HDWallet.random(),
    })

    // Insert previously witnessed payloads into thumbnail archivist
    const httpSuccessTimestamp: TimeStamp = { schema: TimestampSchema, timestamp: Date.now() }
    const [httpSuccessBoundWitness, httpSuccessPayloads] = await new BoundWitnessBuilder()
      .payloads([thumbnailHttpSuccess, httpSuccessTimestamp])
      .build()
    const httpFailTimestamp: TimeStamp = { schema: TimestampSchema, timestamp: Date.now() }
    const [httpFailBoundWitness, httpFailPayloads] = await new BoundWitnessBuilder().payloads([thumbnailHttpFail, httpFailTimestamp]).build()
    const witnessFailTimestamp: TimeStamp = { schema: TimestampSchema, timestamp: Date.now() }
    const [witnessFailBoundWitness, witnessFailPayloads] = await new BoundWitnessBuilder()
      .payloads([thumbnailWitnessFail, witnessFailTimestamp])
      .build()
    await thumbnailArchivist.insert([
      httpSuccessBoundWitness,
      ...httpSuccessPayloads,
      httpFailBoundWitness,
      ...httpFailPayloads,
      witnessFailBoundWitness,
      ...witnessFailPayloads,
    ])

    const thumbnailStore: SearchableStorage = {
      archivist: thumbnailArchivist.address,
      boundWitnessDiviner: thumbnailBoundWitnessDiviner.address,
      payloadDiviner: thumbnailPayloadDiviner.address,
    }

    // Create index store
    indexArchivist = await MemoryArchivist.create({
      config: { name: indexArchivistName, schema: MemoryArchivist.configSchema },
      wallet: await HDWallet.random(),
    })
    indexBoundWitnessDiviner = await MemoryBoundWitnessDiviner.create({
      config: { archivist: indexArchivistName, schema: MemoryBoundWitnessDiviner.configSchema },
      wallet: await HDWallet.random(),
    })
    indexPayloadDiviner = await MemoryPayloadDiviner.create({
      config: { archivist: indexArchivistName, schema: MemoryPayloadDiviner.configSchema },
      wallet: await HDWallet.random(),
    })
    const indexStore: SearchableStorage = {
      archivist: indexArchivist.address,
      boundWitnessDiviner: indexBoundWitnessDiviner.address,
      payloadDiviner: indexPayloadDiviner.address,
    }

    // Create state store
    stateArchivist = await MemoryArchivist.create({
      config: { name: stateArchivistName, schema: MemoryArchivist.configSchema },
      wallet: await HDWallet.random(),
    })
    stateBoundWitnessDiviner = await MemoryBoundWitnessDiviner.create({
      config: { archivist: stateArchivistName, schema: MemoryBoundWitnessDiviner.configSchema },
      wallet: await HDWallet.random(),
    })
    statePayloadDiviner = await MemoryPayloadDiviner.create({
      config: { archivist: stateArchivistName, schema: MemoryPayloadDiviner.configSchema },
      wallet: await HDWallet.random(),
    })
    const stateStore: SearchableStorage = {
      archivist: stateArchivist.address,
      boundWitnessDiviner: stateBoundWitnessDiviner.address,
      payloadDiviner: statePayloadDiviner.address,
    }

    sut = await ImageThumbnailDiviner.create({
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
      sut,
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

    // Allow enough time for diviner to divine
    await delay(1000)
  })
  describe('with no thumbnail for the provided URL', () => {
    const url = 'https://does.not.exist.io'
    const schema = ImageThumbnailDivinerQuerySchema
    it('returns nothing', async () => {
      const query: ImageThumbnailDivinerQuery = { schema, url }
      const result = await sut.divine([query])
      expect(result).toBeArrayOfSize(0)
    })
  })
  describe('with thumbnails for the provided URL', () => {
    const url = sourceUrl
    const schema = ImageThumbnailDivinerQuerySchema
    describe('with no filter criteria', () => {
      it('returns the most recent success', async () => {
        const query: ImageThumbnailDivinerQuery = { schema, url }
        const result = await sut.divine([query])
        expect(result).toBeArrayOfSize(1)
        const expected = await PayloadHasher.hashAsync(thumbnailHttpSuccess)
        expect(result[0]?.sources).toContain(expected)
      })
    })
    describe('with filter criteria', () => {
      describe('for status code', () => {
        it.each([thumbnailHttpSuccess, thumbnailHttpFail])('returns the most recent instance of that status code', async (payload) => {
          const { status } = payload.http
          const query: ImageThumbnailDivinerQuery = { schema, status, url }
          const result = await sut.divine([query])
          expect(result).toBeArrayOfSize(1)
          const expected = await PayloadHasher.hashAsync(payload)
          expect(result[0]?.sources).toContain(expected)
        })
      })
    })
  })
})
