import { assertEx } from '@xylabs/assert'
import { HDWallet } from '@xyo-network/account'
import { asArchivistInstance } from '@xyo-network/archivist-model'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { MemoryBoundWitnessDiviner } from '@xyo-network/diviner-boundwitness-memory'
import { asDivinerInstance } from '@xyo-network/diviner-model'
import { MemoryPayloadDiviner } from '@xyo-network/diviner-payload-memory'
import { ImageThumbnail, isImageThumbnailResultIndex } from '@xyo-network/image-thumbnail-payload-plugin'
import { ManifestWrapper, PackageManifest } from '@xyo-network/manifest'
import { MemoryArchivist } from '@xyo-network/memory-archivist'
import { isModuleState, ModuleFactoryLocator } from '@xyo-network/module-model'
import { MemoryNode } from '@xyo-network/node-memory'
import { TimeStamp, TimestampSchema } from '@xyo-network/witness-timestamp'

import { ImageThumbnailDivinerState } from '../../ImageThumbnailDivinerState'
import { ImageThumbnailStateToIndexCandidateDiviner } from '../ImageThumbnailStateToIndexCandidateDiviner'
import ImageThumbnailStateToIndexCandidateDivinerManifest from './ImageThumbnailStateToIndexCandidateDiviner.json'

/**
 * @group slow
 */
describe('ImageThumbnailStateToIndexCandidateDiviner', () => {
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

  let sut: ImageThumbnailStateToIndexCandidateDiviner
  let node: MemoryNode

  beforeAll(async () => {
    const wallet = await HDWallet.random()
    const locator = new ModuleFactoryLocator()
    locator.register(MemoryArchivist)
    locator.register(MemoryBoundWitnessDiviner)
    locator.register(MemoryPayloadDiviner)
    locator.register(ImageThumbnailStateToIndexCandidateDiviner)
    const manifest = ImageThumbnailStateToIndexCandidateDivinerManifest as PackageManifest
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

    sut = assertEx(asDivinerInstance<ImageThumbnailStateToIndexCandidateDiviner>(await node.resolve('ImageThumbnailStateToIndexCandidateDiviner')))
  })

  describe('divine', () => {
    describe('with no previous state', () => {
      it('return state and no results', async () => {
        const results = await sut.divine()
        expect(results.length).toBe(1)
        const state = results.find(isModuleState<ImageThumbnailDivinerState>)
        expect(state).toBeDefined()
        expect(state?.state.offset).toBe(0)
      })
    })
  })
})
