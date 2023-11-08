import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { ArchivistInstance } from '@xyo-network/archivist-model'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { BoundWitness, isBoundWitness } from '@xyo-network/boundwitness-model'
import { BoundWitnessDivinerQueryPayload, BoundWitnessDivinerQuerySchema } from '@xyo-network/diviner-boundwitness-model'
import { DivinerConfigSchema } from '@xyo-network/diviner-model'
import { DivinerWrapper } from '@xyo-network/diviner-wrapper'
import { ImageThumbnail, ImageThumbnailSchema, isImageThumbnail } from '@xyo-network/image-thumbnail-payload-plugin'
import { isModuleState, ModuleState, ModuleStateSchema } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'
import { isTimestamp, TimeStamp, TimestampSchema } from '@xyo-network/witness-timestamp'

import { ImageThumbnailDivinerLabels, ImageThumbnailDivinerStageLabels } from '../ImageThumbnailDivinerLabels'
import { ImageThumbnailDivinerState } from '../ImageThumbnailDivinerState'
import { ImageThumbnailStateToIndexCandidateDivinerConfigSchema } from './Config'
import { ImageThumbnailStateToIndexCandidateDivinerParams } from './Params'

/**
 * All Payload types involved in index candidates for indexing
 */
export type IndexCandidate = BoundWitness | ImageThumbnail | TimeStamp

/**
 * The response from the ImageThumbnailStateToIndexCandidateDiviner
 */
export type ImageThumbnailStateToIndexCandidateDivinerResponse = [
  /**
   * The next state of the diviner
   */
  nextState: ModuleState<ImageThumbnailDivinerState>,
  /**
   * The index candidates
   */
  ...IndexCandidate[],
]

/**
 * The required payload_schemas within BoundWitnesses to identify index candidates
 */
const payload_schemas = [ImageThumbnailSchema, TimestampSchema]

/**
 * Index candidate identity functions
 */
const indexCandidateIdentityFunctions = [isImageThumbnail, isTimestamp] as const

/**
 * The default order to search Bound Witnesses to identify index candidates
 */
const order = 'asc'

/**
 * The name of the module (for logging purposes)
 */
const moduleName = 'ImageThumbnailStateToIndexCandidateDiviner'

/**
 * Transforms candidates for image thumbnail indexing into their indexed representation
 */
export class ImageThumbnailStateToIndexCandidateDiviner<
  TParams extends ImageThumbnailStateToIndexCandidateDivinerParams = ImageThumbnailStateToIndexCandidateDivinerParams,
> extends AbstractDiviner<TParams> {
  static override configSchemas = [DivinerConfigSchema, ImageThumbnailStateToIndexCandidateDivinerConfigSchema]
  static labels: ImageThumbnailDivinerStageLabels = {
    ...ImageThumbnailDivinerLabels,
    'network.xyo.diviner.stage': 'stateToIndexCandidateDiviner',
  }

  get payloadDivinerLimit() {
    return this.config.payloadDivinerLimit ?? 1_0000
  }

  protected static async getPayloadsInBoundWitness(bw: BoundWitness, archivist: ArchivistInstance): Promise<IndexCandidate[] | undefined> {
    const indexes = payload_schemas.map((schema) => bw.payload_schemas?.findIndex((s) => s === schema))
    const hashes = indexes.map((index) => bw.payload_hashes?.[index])
    const results = await archivist.get(hashes)
    const filteredResults = indexCandidateIdentityFunctions.map((is) => results.find(is))
    if (filteredResults.some((f) => f === undefined)) return undefined
    const indexCandidates: IndexCandidate[] = filteredResults.filter(exists) as IndexCandidate[]
    return [bw, ...indexCandidates]
  }

  protected override async divineHandler(payloads: Payload[] = []): Promise<ImageThumbnailStateToIndexCandidateDivinerResponse> {
    // Retrieve the last state from what was passed in
    const lastState = payloads.find(isModuleState<ImageThumbnailDivinerState>)
    // If there is no last state, start from the beginning
    if (!lastState) return [{ schema: ModuleStateSchema, state: { offset: 0 } }]
    // Otherwise, get the last offset
    const { offset } = lastState.state
    // Get next batch of results starting from the offset
    const boundWitnessDiviner = await this.getBoundWitnessDivinerForStore()
    const query = new PayloadBuilder<BoundWitnessDivinerQueryPayload>({ schema: BoundWitnessDivinerQuerySchema })
      .fields({ limit: this.payloadDivinerLimit, offset, order, payload_schemas })
      .build()
    const batch = await boundWitnessDiviner.divine([query])
    if (batch.length === 0) return [lastState]
    // Get source data
    const sourceArchivist = await this.getArchivistForStore()
    const indexCandidates: IndexCandidate[] = (
      await Promise.all(
        batch.filter(isBoundWitness).map((bw) => ImageThumbnailStateToIndexCandidateDiviner.getPayloadsInBoundWitness(bw, sourceArchivist)),
      )
    )
      .filter(exists)
      .flat()
    const nextState = { schema: ModuleStateSchema, state: { ...lastState.state, offset: offset + batch.length } }
    return [nextState, ...indexCandidates]
  }
  /**
   * Retrieves the archivist for the payloadStore
   * @returns The archivist for the payloadStore
   */
  protected async getArchivistForStore() {
    const name = assertEx(this.config?.payloadStore?.archivist, () => `${moduleName}: Config for payloadStore.archivist not specified`)
    const mod = assertEx(await this.resolve(name), () => `${moduleName}: Failed to resolve payloadStore.archivist`)
    return ArchivistWrapper.wrap(mod, this.account)
  }

  /**
   * Retrieves the BoundWitness Diviner for the payloadStore
   * @returns The BoundWitness Diviner for the payloadStore
   */
  protected async getBoundWitnessDivinerForStore() {
    const name = assertEx(
      this.config?.payloadStore?.boundWitnessDiviner,
      () => `${moduleName}: Config for payloadStore.boundWitnessDiviner not specified`,
    )
    const mod = assertEx(await this.resolve(name), () => `${moduleName}: Failed to resolve payloadStore.boundWitnessDiviner`)
    return DivinerWrapper.wrap(mod, this.account)
  }
}
