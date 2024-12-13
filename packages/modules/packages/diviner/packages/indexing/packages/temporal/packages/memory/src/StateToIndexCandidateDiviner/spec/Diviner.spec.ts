import '@xylabs/vitest-extended'

import { assertEx } from '@xylabs/assert'
import { delay } from '@xylabs/delay'
import type { Hex } from '@xylabs/hex'
import { HDWallet } from '@xyo-network/account'
import type { MemoryArchivist } from '@xyo-network/archivist-memory'
import { asArchivistInstance } from '@xyo-network/archivist-model'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import type { IndexingDivinerState } from '@xyo-network/diviner-indexing-model'
import { asDivinerInstance } from '@xyo-network/diviner-model'
import type { PackageManifestPayload } from '@xyo-network/manifest'
import { ManifestWrapper } from '@xyo-network/manifest'
import { ModuleFactoryLocator } from '@xyo-network/module-factory-locator'
import type { ModuleState } from '@xyo-network/module-model'
import { isModuleState, ModuleStateSchema } from '@xyo-network/module-model'
import type { MemoryNode } from '@xyo-network/node-memory'
import { SequenceConstants } from '@xyo-network/payload-model'
import type { TimeStamp } from '@xyo-network/witness-timestamp'
import { TimestampSchema } from '@xyo-network/witness-timestamp'
import {
  beforeAll,
  describe, expect, it,
} from 'vitest'

import { TemporalIndexingDivinerStateToIndexCandidateDiviner } from '../Diviner.ts'
import TemporalStateToIndexCandidateDivinerManifest from './TemporalStateToIndexCandidateDiviner.json' assert {type: 'json'}

/**
 * @group slow
 */
describe('TemporalStateToIndexCandidateDiviner', () => {
  const sourceUrl = 'https://placekitten.com/200/300'
  const thumbnailHttpSuccess = {
    http: { status: 200 },
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

  const thumbnailCodeFail = {
    http: { code: 'FAILED' },
    schema: 'network.xyo.image.thumbnail',
    sourceUrl,
  }

  const thumbnailWitnessFail = {
    http: { ipAddress: '104.17.96.13' },
    schema: 'network.xyo.image.thumbnail',
    sourceUrl,
  }
  const witnessedThumbnails = [thumbnailHttpSuccess, thumbnailHttpFail, thumbnailCodeFail, thumbnailWitnessFail]

  let sut: TemporalIndexingDivinerStateToIndexCandidateDiviner
  let node: MemoryNode

  const cursors: Hex[] = [
    SequenceConstants.minLocalSequence,
  ]

  beforeAll(async () => {
    const wallet = await HDWallet.random()
    const locator = new ModuleFactoryLocator()
    locator.register(TemporalIndexingDivinerStateToIndexCandidateDiviner)
    const manifest = TemporalStateToIndexCandidateDivinerManifest as PackageManifestPayload
    const manifestWrapper = new ManifestWrapper(manifest, wallet, locator)
    node = await manifestWrapper.loadNodeFromIndex(0)
    await node.start()

    const privateModules = manifest.nodes[0].modules?.private ?? []
    const publicModules = manifest.nodes[0].modules?.public ?? []
    const mods = await node.resolve('*')
    expect(mods.length).toBe(privateModules.length + publicModules.length + 1)

    // Insert previously witnessed payloads into thumbnail archivist
    const httpSuccessTimestamp: TimeStamp = { schema: TimestampSchema, timestamp: Date.now() }
    const [httpSuccessBoundWitness, httpSuccessPayloads] = await new BoundWitnessBuilder()
      .payloads([thumbnailHttpSuccess, httpSuccessTimestamp])
      .build()
    const httpFailTimestamp: TimeStamp = { schema: TimestampSchema, timestamp: Date.now() }
    const [httpFailBoundWitness, httpFailPayloads] = await (new BoundWitnessBuilder().payloads([thumbnailHttpFail, httpFailTimestamp])).build()

    const witnessFailTimestamp: TimeStamp = { schema: TimestampSchema, timestamp: Date.now() }
    const [witnessFailBoundWitness, witnessFailPayloads] = await new BoundWitnessBuilder()
      .payloads([thumbnailWitnessFail, witnessFailTimestamp])
      .build()

    const codeFailTimestamp: TimeStamp = { schema: TimestampSchema, timestamp: Date.now() }
    const [codeFailBoundWitness, codeFailPayloads] = await (new BoundWitnessBuilder().payloads([thumbnailCodeFail, codeFailTimestamp])).build()

    const thumbnailArchivist = assertEx(asArchivistInstance<MemoryArchivist>(await node.resolve('ImageThumbnailArchivist')))
    const testCases = [
      [httpSuccessBoundWitness, ...httpSuccessPayloads],
      [httpFailBoundWitness, ...httpFailPayloads],
      [witnessFailBoundWitness, ...witnessFailPayloads],
      [codeFailBoundWitness, ...codeFailPayloads],
    ]

    for (const [bw, ...payloads] of testCases) {
      const response = await thumbnailArchivist.insert([bw, ...payloads])
      const cursor = response.at(-1)?._sequence
      expect(cursor).toBeDefined()
      cursors.push(assertEx(cursor))
      await delay(2)
    }

    sut = assertEx(
      asDivinerInstance(await node.resolve('TemporalStateToIndexCandidateDiviner')),
    ) as TemporalIndexingDivinerStateToIndexCandidateDiviner
  })

  describe('divine', () => {
    describe('with no previous state', () => {
      it('return state and no results', async () => {
        const results = await sut.divine()
        expect(results.length).toBe(1)
        const state = results.find(isModuleState<IndexingDivinerState>)
        expect(state).toBeDefined()
        expect(state?.state.cursor).toBe(SequenceConstants.minLocalSequence)
      })
    })
    describe('with previous state', () => {
      it.each(cursors)('return next state and batch results', async (cursor) => {
        // Test across all offsets
        const lastState: ModuleState<IndexingDivinerState> = { schema: ModuleStateSchema, state: { cursor } }
        const results = await sut.divine([lastState])

        // Validate expected results length
        const expectedIndividualResults = witnessedThumbnails.length - Number.parseInt(lastState.state.cursor, 16)
        // expectedIndividualResults * 3 [BW, ImageThumbnail, TimeStamp] + 1 [ModuleState]
        const expectedResults = expectedIndividualResults * 3 + 1
        expect(results.length).toBe(expectedResults)

        // Validate expected state
        const nextState = results.find(isModuleState<IndexingDivinerState>)
        expect(nextState).toBeDefined()
        expect(nextState?.state.offset).toBe(witnessedThumbnails.length)

        // Validate expected individual results
        // const bws = results.filter(isBoundWitness)
        // expect(bws).toBeArrayOfSize(expectedIndividualResults)
        // const images = results.filter(isImageThumbnail)
        // expect(images).toBeArrayOfSize(expectedIndividualResults)
        // const timestamps = results.filter(isTimestamp)
        // expect(timestamps).toBeArrayOfSize(expectedIndividualResults)
      })
    })
  })
})
