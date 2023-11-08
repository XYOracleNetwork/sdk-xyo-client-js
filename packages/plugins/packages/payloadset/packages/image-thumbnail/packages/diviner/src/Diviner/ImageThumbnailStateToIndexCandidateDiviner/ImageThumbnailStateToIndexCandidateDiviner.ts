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

const moduleName = 'ImageThumbnailStateToIndexCandidateDiviner'

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
  ...(BoundWitness | ImageThumbnail | TimeStamp)[],
]

/**
 * The required payload_schemas within BoundWitnesses to identify index candidates
 */
const payload_schemas = [ImageThumbnailSchema, TimestampSchema]

/**
 * The identity functions to verify the payload_schemas within BoundWitnesses conform to the required payload_schemas
 */
// const payloadSchemaIdentityFunctions = [isImageThumbnail, isTimestamp] as const

/**
 * The default order to search Bound Witnesses to identify index candidates
 */
const order = 'asc'

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

  protected static async getPayloadsInBoundWitness(
    bw: BoundWitness,
    archivist: ArchivistInstance,
  ): Promise<[BoundWitness, ImageThumbnail, TimeStamp] | undefined> {
    // TODO: Simplify & make more generic for reuse
    // const indexes = payload_schemas.map((schema) => bw.payload_schemas?.findIndex((s) => s === schema))
    // const hashes = indexes.map((index) => bw.payload_hashes?.[index])
    // const payloads = await archivist.get(hashes)
    // const foo = payloadSchemaIdentityFunctions.map((is) => payloads.find(is))
    // if (foo.some((f) => f === undefined)) return undefined
    // return [bw, ...foo]
    const imageThumbnailIndex = bw.payload_schemas?.findIndex((schema) => schema === ImageThumbnailSchema)
    const timestampIndex = bw.payload_schemas?.findIndex((schema) => schema === TimestampSchema)
    if (imageThumbnailIndex === -1 || timestampIndex === -1) return undefined
    const imageThumbnailHash = bw.payload_hashes?.[imageThumbnailIndex]
    const timestampHash = bw.payload_hashes?.[timestampIndex]
    const results = await archivist.get([imageThumbnailHash, timestampHash])
    const imageThumbnailPayload = results.find(isImageThumbnail)
    if (!imageThumbnailPayload) {
      console.log(`${moduleName}: Could not find ${ImageThumbnailSchema} Payload (${imageThumbnailHash})`)
      return undefined
    }
    const timestampPayload = results.find(isTimestamp)
    if (!timestampPayload) {
      console.log(`${moduleName}: Could not find ${TimestampSchema} Payload (${timestampHash})`)
      return undefined
    }
    return [bw, imageThumbnailPayload, timestampPayload]
  }

  protected override async divineHandler(payloads: Payload[] = []): Promise<ImageThumbnailStateToIndexCandidateDivinerResponse> {
    // Retrieve the last state
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
    const indexCandidates: [BoundWitness, ImageThumbnail, TimeStamp][] = (
      await Promise.all(
        batch.filter(isBoundWitness).map((bw) => ImageThumbnailStateToIndexCandidateDiviner.getPayloadsInBoundWitness(bw, sourceArchivist)),
      )
    ).filter(exists)
    const nextState = { schema: ModuleStateSchema, state: { ...lastState.state, offset: batch.length } }
    return [nextState, ...indexCandidates.flat()]
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
