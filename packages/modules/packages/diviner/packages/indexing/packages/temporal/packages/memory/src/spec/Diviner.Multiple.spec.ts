import '@xylabs/vitest-extended'

import { filterAs } from '@xylabs/array'
import { assertEx } from '@xylabs/assert'
import { delay } from '@xylabs/delay'
import { AsObjectFactory } from '@xylabs/object'
import type { MemoryArchivist } from '@xyo-network/archivist-memory'
import { asArchivistInstance } from '@xyo-network/archivist-model'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { asBoundWitness, isBoundWitness } from '@xyo-network/boundwitness-model'
import { asDivinerInstance } from '@xyo-network/diviner-model'
import type { PayloadDivinerQueryPayload } from '@xyo-network/diviner-payload-model'
import { PayloadDivinerQuerySchema } from '@xyo-network/diviner-payload-model'
import { isTemporalIndexingDivinerResultIndex } from '@xyo-network/diviner-temporal-indexing-model'
import type { PackageManifestPayload } from '@xyo-network/manifest'
import { ManifestWrapper } from '@xyo-network/manifest'
import { ModuleFactoryLocator } from '@xyo-network/module-factory-locator'
import type {
  Labels, ModuleState, StateDictionary,
} from '@xyo-network/module-model'
import { isModuleState } from '@xyo-network/module-model'
import type { MemoryNode } from '@xyo-network/node-memory'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import type { Payload } from '@xyo-network/payload-model'
import { HDWallet } from '@xyo-network/wallet'
import type { TimeStamp } from '@xyo-network/witness-timestamp'
import { TimestampSchema } from '@xyo-network/witness-timestamp'
import {
  beforeAll,
  describe, expect, it,
} from 'vitest'

import { TemporalIndexingDiviner } from '../Diviner.ts'
import { TemporalIndexingDivinerDivinerQueryToIndexQueryDiviner } from '../DivinerQueryToIndexQueryDiviner/index.ts'
import { TemporalIndexingDivinerIndexCandidateToIndexDiviner } from '../IndexCandidateToIndexDiviner/index.ts'
import { TemporalIndexingDivinerIndexQueryResponseToDivinerQueryResponseDiviner } from '../IndexQueryResponseToDivinerQueryResponseDiviner/index.ts'
import { TemporalIndexingDivinerStateToIndexCandidateDiviner } from '../StateToIndexCandidateDiviner/index.ts'
import imageThumbnailDivinerManifest from './TemporalDiviner.json' with { type: 'json' }

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
describe('TemporalIndexingDiviner - Multiple', () => {
  const sourceUrl = 'https://placekitten.com/200/300'
  const thumbnailHttpSuccess: ImageThumbnail = {
    http: { status: 200 },
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
    http: { code: 'FAILED' },
    schema: 'network.xyo.image.thumbnail',
    sourceUrl,
  }

  const thumbnailWitnessFail: ImageThumbnail = {

    http: { ipAddress: '104.17.96.13' },
    schema: 'network.xyo.image.thumbnail',
    sourceUrl,
  }
  const witnessedThumbnails = [thumbnailHttpSuccess, thumbnailHttpFail, thumbnailCodeFail, thumbnailWitnessFail]

  let sut: TemporalIndexingDiviner
  let node: MemoryNode

  beforeAll(async () => {
    const labels: Labels = { 'network.xyo.image.thumbnail': 'diviner' }
    const wallet = await HDWallet.random()
    const locator = new ModuleFactoryLocator()
    locator.register(TemporalIndexingDivinerDivinerQueryToIndexQueryDiviner.factory(), labels)
    locator.register(TemporalIndexingDivinerIndexCandidateToIndexDiviner.factory(), labels)
    locator.register(TemporalIndexingDivinerIndexQueryResponseToDivinerQueryResponseDiviner.factory(), labels)
    locator.register(TemporalIndexingDivinerStateToIndexCandidateDiviner.factory(), labels)
    locator.register(TemporalIndexingDiviner.factory(), labels)
    const manifest = imageThumbnailDivinerManifest as PackageManifestPayload
    const manifestWrapper = new ManifestWrapper(manifest, wallet, locator)
    node = await manifestWrapper.loadNodeFromIndex(0)
    await node.start()

    // Insert previously witnessed payloads into thumbnail archivist
    const timestamp: TimeStamp = { schema: TimestampSchema, timestamp: Date.now() }
    const [boundWitness, payloads] = await new BoundWitnessBuilder().payloads([timestamp, ...witnessedThumbnails]).build()

    const thumbnailArchivist = assertEx(asArchivistInstance<MemoryArchivist>(await node.resolve('ImageThumbnailArchivist')))
    await thumbnailArchivist.insert([boundWitness, ...payloads])

    sut = assertEx(asDivinerInstance(await node.resolve('ImageThumbnailDiviner'))) as TemporalIndexingDiviner

    // Allow enough time for diviner to divine
    await delay(1000)
  }, 40_000)
  describe('diviner state', () => {
    let stateArchivist: MemoryArchivist
    beforeAll(async () => {
      const mod = await node.resolve('AddressStateArchivist')
      stateArchivist = assertEx(asArchivistInstance<MemoryArchivist>(mod))
    })
    it('has expected bound witnesses', async () => {
      const payloads = await stateArchivist.all()
      const stateBoundWitnesses = payloads.filter(x => isBoundWitness(x))
      expect(stateBoundWitnesses).toBeArrayOfSize(1)
      for (const stateBoundWitness of stateBoundWitnesses) {
        expect(stateBoundWitness).toBeObject()
        expect(stateBoundWitness.addresses).toBeArrayOfSize(1)
        expect(stateBoundWitness.addresses).toContain(sut.address)
      }
    })
    it('has expected state', async () => {
      const payloads = await stateArchivist.all()
      try {
        const asModuleState = AsObjectFactory.create<ModuleState<StateDictionary>>(isModuleState)
        const statePayloads = filterAs(payloads, asModuleState)
        expect(statePayloads).toBeArrayOfSize(1)
        expect(statePayloads.at(-1)).toBeObject()
        const statePayload = assertEx(statePayloads.at(-1))
        expect(statePayload.state).toBeObject()
        expect(statePayload.state?.cursor).toBeDefined()
      } catch (ex) {
        console.error('State payloads:', payloads)
        throw ex
      }
    })
  })
  describe('diviner index', () => {
    let indexArchivist: MemoryArchivist
    beforeAll(async () => {
      const mod = await node.resolve('ImageThumbnailDivinerIndexArchivist')
      indexArchivist = assertEx(asArchivistInstance<MemoryArchivist>(mod))
    })
    // We're not signing indexes for performance reasons
    it.skip('has expected bound witnesses', async () => {
      const payloads = await indexArchivist.all()
      const indexBoundWitnesses = payloads.filter(x => isBoundWitness(x))
      expect(indexBoundWitnesses).toBeArrayOfSize(1)
      const indexBoundWitness = indexBoundWitnesses[0]
      expect(indexBoundWitness).toBeObject()
      expect(indexBoundWitness.addresses).toBeArrayOfSize(1)
      expect(indexBoundWitness.addresses).toContain(sut.address)
    })
    it('has expected index', async () => {
      const payloads = await indexArchivist.all()
      const indexPayloads = payloads.filter(isTemporalIndexingDivinerResultIndex)
      expect(indexPayloads).toBeArrayOfSize((witnessedThumbnails).length)
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
        const payload = assertEx((witnessedThumbnails).at(-1))
        const expected = await PayloadBuilder.dataHash(payload)
        expect(result?.$sources).toContain(expected)
      })
    })
    describe('with filter criteria', () => {
      describe('for status code', () => {
        const cases: ImageThumbnail[] = [thumbnailHttpSuccess, thumbnailHttpFail]
        it.each(cases)('returns the most recent instance of that status code', async (payload) => {
          const { status } = payload.http ?? {}
          const query: Query = {
            schema, status, url,
          }
          const results = await sut.divine([query])
          const result = results.find(isTemporalIndexingDivinerResultIndex)
          expect(result).toBeDefined()
          const expected = await PayloadBuilder.dataHash(payload)
          expect(result?.$sources).toContain(expected)
        })
      })
    })
  })
})
