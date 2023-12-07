import { assertEx } from '@xylabs/assert'
import { delay } from '@xylabs/delay'
import { HDWallet } from '@xyo-network/account'
import { asArchivistInstance } from '@xyo-network/archivist-model'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { isBoundWitness } from '@xyo-network/boundwitness-model'
import { MemoryBoundWitnessDiviner } from '@xyo-network/diviner-boundwitness-memory'
import { asDivinerInstance } from '@xyo-network/diviner-model'
import { MemoryPayloadDiviner } from '@xyo-network/diviner-payload-memory'
import { PayloadDivinerQueryPayload, PayloadDivinerQuerySchema } from '@xyo-network/diviner-payload-model'
import { isTemporalIndexingDivinerResultIndex } from '@xyo-network/diviner-temporal-indexing-model'
import { PayloadHasher } from '@xyo-network/hash'
import { ManifestWrapper, PackageManifest } from '@xyo-network/manifest'
import { MemoryArchivist } from '@xyo-network/memory-archivist'
import { isModuleState, Labels, ModuleFactoryLocator } from '@xyo-network/module-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { Payload } from '@xyo-network/payload-model'
import { TimeStamp, TimestampSchema } from '@xyo-network/witness-timestamp'

import { TemporalIndexingDiviner } from '../Diviner'
import { TemporalIndexingDivinerDivinerQueryToIndexQueryDiviner } from '../DivinerQueryToIndexQueryDiviner'
import { TemporalIndexingDivinerIndexCandidateToIndexDiviner } from '../IndexCandidateToIndexDiviner'
import { TemporalIndexingDivinerIndexQueryResponseToDivinerQueryResponseDiviner } from '../IndexQueryResponseToDivinerQueryResponseDiviner'
import { TemporalIndexingDivinerStateToIndexCandidateDiviner } from '../StateToIndexCandidateDiviner'
import imageThumbnailDivinerManifest from './TemporalDiviner.json'

type ImageThumbnail = Payload<{
  http?: {
    code?: string
    ipAddress?: string
    status?: number
  }
  // schema: 'network.xyo.image.thumbnail'
  sourceHash?: string
  sourceUrl: string
  url?: string
}>

type Query = PayloadDivinerQueryPayload & { status?: number; success?: boolean; url?: string }

/**
 * @group slow
 */
describe('TemporalIndexingDiviner', () => {
  const sourceUrl = 'https://placekitten.com/200/300'
  const thumbnailHttpSuccess: ImageThumbnail = {
    http: {
      status: 200,
    },
    schema: 'network.xyo.image.thumbnail',
    sourceHash: '7f39363514d9d9b958a5a993edeba35cb44f912c7072ed9ddd628728ac0fd681',
    sourceUrl,
    url: 'data:image/png;base64,===',
  }

  const thumbnailHttpFail: ImageThumbnail = {
    http: {
      ipAddress: '104.17.96.13',
      status: 429,
    },
    schema: 'network.xyo.image.thumbnail',
    sourceUrl,
  }

  const thumbnailCodeFail: ImageThumbnail = {
    http: {
      code: 'FAILED',
    },
    schema: 'network.xyo.image.thumbnail',
    sourceUrl,
  }

  const thumbnailWitnessFail: ImageThumbnail = {
    http: {
      ipAddress: '104.17.96.13',
    },
    schema: 'network.xyo.image.thumbnail',
    sourceUrl,
  }
  const witnessedThumbnails = [thumbnailHttpSuccess, thumbnailHttpFail, thumbnailCodeFail, thumbnailWitnessFail]

  let sut: TemporalIndexingDiviner
  let node: MemoryNode

  beforeAll(async () => {
    const labels: Labels = {
      'network.xyo.image.thumbnail': 'diviner',
    }
    const wallet = await HDWallet.random()
    const locator = new ModuleFactoryLocator()
    locator.register(MemoryArchivist)
    locator.register(MemoryBoundWitnessDiviner)
    locator.register(MemoryPayloadDiviner)
    locator.register(TemporalIndexingDivinerDivinerQueryToIndexQueryDiviner, labels)
    locator.register(TemporalIndexingDivinerIndexCandidateToIndexDiviner, labels)
    locator.register(TemporalIndexingDivinerIndexQueryResponseToDivinerQueryResponseDiviner, labels)
    locator.register(TemporalIndexingDivinerStateToIndexCandidateDiviner, labels)
    locator.register(TemporalIndexingDiviner, labels)
    const manifest = imageThumbnailDivinerManifest as PackageManifest
    const manifestWrapper = new ManifestWrapper(manifest, wallet, locator)
    node = await manifestWrapper.loadNodeFromIndex(0)
    await node.start()

    const privateModules = manifest.nodes[0].modules?.private ?? []
    const publicModules = manifest.nodes[0].modules?.public ?? []
    const mods = await node.resolve()
    expect(mods.length).toBe(privateModules.length + publicModules.length + 1)

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

    const codeFailTimestamp: TimeStamp = { schema: TimestampSchema, timestamp: Date.now() }
    const [codeFailBoundWitness, codeFailPayloads] = await new BoundWitnessBuilder().payloads([thumbnailCodeFail, codeFailTimestamp]).build()

    const thumbnailArchivist = assertEx(asArchivistInstance<MemoryArchivist>(await node.resolve('ImageThumbnailArchivist')))
    await thumbnailArchivist.insert([
      httpSuccessBoundWitness,
      ...httpSuccessPayloads,
      httpFailBoundWitness,
      ...httpFailPayloads,
      witnessFailBoundWitness,
      ...witnessFailPayloads,
      codeFailBoundWitness,
      ...codeFailPayloads,
    ])

    sut = assertEx(asDivinerInstance<TemporalIndexingDiviner>(await node.resolve('ImageThumbnailDiviner')))

    // Allow enough time for diviner to divine
    await delay(5000)
  }, 40000)
  describe('diviner state', () => {
    let stateArchivist: MemoryArchivist
    beforeAll(async () => {
      const mod = await node.resolve('AddressStateArchivist')
      stateArchivist = assertEx(asArchivistInstance<MemoryArchivist>(mod))
    })
    it('has expected bound witnesses', async () => {
      const payloads = await stateArchivist.all()
      const stateBoundWitnesses = payloads.filter(isBoundWitness)
      expect(stateBoundWitnesses).toBeArrayOfSize(2)
      stateBoundWitnesses.forEach((stateBoundWitness) => {
        expect(stateBoundWitness).toBeObject()
        expect(stateBoundWitness.addresses).toBeArrayOfSize(1)
        expect(stateBoundWitness.addresses).toContain(sut.address)
      })
    })
    it('has expected state', async () => {
      const payloads = await stateArchivist.all()
      const statePayloads = payloads.filter(isModuleState)
      expect(statePayloads).toBeArrayOfSize(2)
      expect(statePayloads.at(-1)).toBeObject()
      const statePayload = assertEx(statePayloads.at(-1))
      expect(statePayload.state).toBeObject()
      expect(statePayload.state?.offset).toBe(witnessedThumbnails.length)
    })
  })
  describe('diviner index', () => {
    let indexArchivist: MemoryArchivist
    beforeAll(async () => {
      const mod = await node.resolve('ImageThumbnailDivinerIndexArchivist')
      indexArchivist = assertEx(asArchivistInstance<MemoryArchivist>(mod))
    })
    // NOTE: We're not signing indexes for performance reasons
    it.skip('has expected bound witnesses', async () => {
      const payloads = await indexArchivist.all()
      const indexBoundWitnesses = payloads.filter(isBoundWitness)
      expect(indexBoundWitnesses).toBeArrayOfSize(1)
      const indexBoundWitness = indexBoundWitnesses[0]
      expect(indexBoundWitness).toBeObject()
      expect(indexBoundWitness.addresses).toBeArrayOfSize(1)
      expect(indexBoundWitness.addresses).toContain(sut.address)
    })
    it('has expected index', async () => {
      const payloads = await indexArchivist.all()
      const indexPayloads = payloads.filter(isTemporalIndexingDivinerResultIndex)
      expect(indexPayloads).toBeArrayOfSize(witnessedThumbnails.length)
    })
  })
  describe('with no thumbnail for the provided URL', () => {
    const url = 'https://does.not.exist.io'
    const schema = PayloadDivinerQuerySchema
    it('returns nothing', async () => {
      const query: Query = { schema, url }
      const result = await sut.divine([query])
      expect(result).toBeArrayOfSize(0)
    })
  })
  describe('with thumbnails for the provided URL', () => {
    const url = sourceUrl
    const schema = PayloadDivinerQuerySchema
    describe('with no filter criteria', () => {
      it('returns the most recent result', async () => {
        const query: Query = { schema, url }
        const results = await sut.divine([query])
        const result = results.find(isTemporalIndexingDivinerResultIndex)
        expect(result).toBeDefined()
        const expected = await PayloadHasher.hashAsync(thumbnailCodeFail)
        expect(result?.sources).toContain(expected)
      })
    })
    describe('with filter criteria', () => {
      describe('for status code', () => {
        const cases: ImageThumbnail[] = [thumbnailHttpSuccess, thumbnailHttpFail]
        it.each(cases)('returns the most recent instance of that status code', async (payload) => {
          const { status } = payload.http ?? {}
          const query: Query = { schema, status, url }
          const results = await sut.divine([query])
          const result = results.find(isTemporalIndexingDivinerResultIndex)
          expect(result).toBeDefined()
          const expected = await PayloadHasher.hashAsync(payload)
          expect(result?.sources).toContain(expected)
        })
      })
      describe.skip('for success (most recent)', () => {
        const cases: ImageThumbnail[] = [thumbnailHttpSuccess]
        it.each(cases)('returns the most recent instance of that success state', async (payload) => {
          const success = !!(payload.url ?? false)
          const query: Query = { schema, success, url }
          const results = await sut.divine([query])
          const result = results.find(isTemporalIndexingDivinerResultIndex)
          expect(result).toBeDefined()
          const expected = await PayloadHasher.hashAsync(payload)
          expect(result?.sources).toContain(expected)
        })
      })
      describe.skip('for failure (most recent)', () => {
        const cases: ImageThumbnail[] = [thumbnailCodeFail]
        it.each(cases)('returns the most recent instance of that success state', async (payload) => {
          const success = !!(payload.url ?? false)
          const query: Query = { schema, success, url }
          const results = await sut.divine([query])
          const result = results.find(isTemporalIndexingDivinerResultIndex)
          expect(result).toBeDefined()
          const expected = await PayloadHasher.hashAsync(payload)
          expect(result?.sources).toContain(expected)
        })
      })
    })
  })
})
