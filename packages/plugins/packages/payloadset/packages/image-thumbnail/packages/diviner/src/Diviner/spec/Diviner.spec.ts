import { delay } from '@xylabs/delay'
import { HDWallet } from '@xyo-network/account'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { PayloadHasher } from '@xyo-network/core'
import { MemoryBoundWitnessDiviner } from '@xyo-network/diviner-boundwitness-memory'
import { MemoryPayloadDiviner } from '@xyo-network/diviner-payload-memory'
import {
  ImageThumbnailDivinerQuery,
  ImageThumbnailDivinerQuerySchema,
  isImageThumbnailResult,
  SearchableStorage,
} from '@xyo-network/image-thumbnail-payload-plugin'
import { MemoryArchivist } from '@xyo-network/memory-archivist'
import { MemoryNode } from '@xyo-network/node-memory'
import { TimeStamp, TimestampSchema } from '@xyo-network/witness-timestamp'

import { ImageThumbnailDiviner } from '../Diviner'

/**
 * @group slow
 */
describe('ImageThumbnailDiviner', () => {
  const pollFrequency = 10
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
    ;[
      thumbnailArchivist,
      thumbnailBoundWitnessDiviner,
      thumbnailPayloadDiviner,
      indexArchivist,
      indexBoundWitnessDiviner,
      indexPayloadDiviner,
      stateArchivist,
      stateBoundWitnessDiviner,
      statePayloadDiviner,
      node,
    ] = await Promise.all([
      // Create thumbnail store
      await MemoryArchivist.create({
        config: { name: thumbnailArchivistName, schema: MemoryArchivist.configSchema },
        wallet: await HDWallet.random(),
      }),
      await MemoryBoundWitnessDiviner.create({
        config: { archivist: thumbnailArchivistName, schema: MemoryBoundWitnessDiviner.configSchema },
        wallet: await HDWallet.random(),
      }),
      await MemoryPayloadDiviner.create({
        config: { archivist: thumbnailArchivistName, schema: MemoryPayloadDiviner.configSchema },
        wallet: await HDWallet.random(),
      }),
      // Create index store
      await MemoryArchivist.create({
        config: { name: indexArchivistName, schema: MemoryArchivist.configSchema },
        wallet: await HDWallet.random(),
      }),
      await MemoryBoundWitnessDiviner.create({
        config: { archivist: indexArchivistName, schema: MemoryBoundWitnessDiviner.configSchema },
        wallet: await HDWallet.random(),
      }),
      await MemoryPayloadDiviner.create({
        config: { archivist: indexArchivistName, schema: MemoryPayloadDiviner.configSchema },
        wallet: await HDWallet.random(),
      }),
      // Create state store
      await MemoryArchivist.create({
        config: { name: stateArchivistName, schema: MemoryArchivist.configSchema },
        wallet: await HDWallet.random(),
      }),
      await MemoryBoundWitnessDiviner.create({
        config: { archivist: stateArchivistName, schema: MemoryBoundWitnessDiviner.configSchema },
        wallet: await HDWallet.random(),
      }),
      await MemoryPayloadDiviner.create({
        config: { archivist: stateArchivistName, schema: MemoryPayloadDiviner.configSchema },
        wallet: await HDWallet.random(),
      }),
      // Create node
      await MemoryNode.create({
        config: { schema: MemoryNode.configSchema },
        wallet: await HDWallet.random(),
      }),
    ])

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
    const indexStore: SearchableStorage = {
      archivist: indexArchivist.address,
      boundWitnessDiviner: indexBoundWitnessDiviner.address,
      payloadDiviner: indexPayloadDiviner.address,
    }
    const stateStore: SearchableStorage = {
      archivist: stateArchivist.address,
      boundWitnessDiviner: stateBoundWitnessDiviner.address,
      payloadDiviner: statePayloadDiviner.address,
    }
    sut = await ImageThumbnailDiviner.create({
      config: { indexStore, pollFrequency, schema: ImageThumbnailDiviner.configSchema, stateStore, thumbnailStore },
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

    await node.start()
    await Promise.all(
      modules.map(async (mod) => {
        await node.register(mod)
        await node.attach(mod.address, true)
      }),
    )

    // Allow enough time for diviner to divine
    await delay(pollFrequency * 10)
  }, 20000)
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
        const results = await sut.divine([query])
        const result = results.find(isImageThumbnailResult)
        expect(result).toBeDefined()
        const expected = await PayloadHasher.hashAsync(thumbnailHttpSuccess)
        expect(result?.sources).toContain(expected)
      })
    })
    describe('with filter criteria', () => {
      describe('for status code', () => {
        const cases = [thumbnailHttpSuccess, thumbnailHttpFail]
        it.each(cases)('returns the most recent instance of that status code', async (payload) => {
          const { status } = payload.http
          const query: ImageThumbnailDivinerQuery = { schema, status, url }
          const results = await sut.divine([query])
          const result = results.find(isImageThumbnailResult)
          expect(result).toBeDefined()
          const expected = await PayloadHasher.hashAsync(payload)
          expect(result?.sources).toContain(expected)
        })
      })
      describe('for success', () => {
        const cases = [thumbnailHttpFail, thumbnailWitnessFail]
        it.each(cases)('returns the most recent instance of that success state', async (payload) => {
          const success = (payload?.http as { status?: number })?.status ? true : false
          const query: ImageThumbnailDivinerQuery = { schema, success, url }
          const results = await sut.divine([query])
          const result = results.find(isImageThumbnailResult)
          expect(result).toBeDefined()
          const expected = await PayloadHasher.hashAsync(payload)
          expect(result?.sources).toContain(expected)
        })
      })
    })
  })
})
