import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { ArchivistInstance } from '@xyo-network/archivist-model'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { BoundWitness, isBoundWitness } from '@xyo-network/boundwitness-model'
import { BoundWitnessDivinerQueryPayload, BoundWitnessDivinerQuerySchema } from '@xyo-network/diviner-boundwitness-model'
import { DivinerConfig, DivinerConfigSchema, DivinerParams } from '@xyo-network/diviner-model'
import { DivinerWrapper } from '@xyo-network/diviner-wrapper'
import { ImageThumbnail, ImageThumbnailSchema, isImageThumbnail, SearchableStorage } from '@xyo-network/image-thumbnail-payload-plugin'
import { AnyConfigSchema, isModuleState, ModuleState, ModuleStateSchema } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'
import { isTimestamp, TimeStamp, TimestampSchema } from '@xyo-network/witness-timestamp'

import { ImageThumbnailDivinerLabels, ImageThumbnailDivinerStageLabels } from './ImageThumbnailDivinerLabels'
import { ImageThumbnailDivinerState } from './ImageThumbnailDivinerState'

export type ImageThumbnailStateToIndexCandidateDivinerSchema = ''
export const ImageThumbnailStateToIndexCandidateDivinerSchema: ImageThumbnailStateToIndexCandidateDivinerSchema = ''

export type ImageThumbnailStateToIndexCandidateDivinerConfigSchema = `${ImageThumbnailStateToIndexCandidateDivinerSchema}.config`
export const ImageThumbnailStateToIndexCandidateDivinerConfigSchema: ImageThumbnailStateToIndexCandidateDivinerConfigSchema = `${ImageThumbnailStateToIndexCandidateDivinerSchema}.config`

export type ImageThumbnailStateToIndexCandidateDivinerConfig = DivinerConfig<{
  payloadDivinerLimit?: number
  /**
   * Where the diviner should look for stored thumbnails
   */
  payloadStore?: SearchableStorage
  schema: ImageThumbnailStateToIndexCandidateDivinerConfigSchema
}>

export type ImageThumbnailStateToIndexCandidateDivinerParams = DivinerParams<AnyConfigSchema<ImageThumbnailStateToIndexCandidateDivinerConfig>>

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

  private static async getPayloadsInBoundWitness(
    bw: BoundWitness,
    archivist: ArchivistInstance,
  ): Promise<[BoundWitness, ImageThumbnail, TimeStamp] | undefined> {
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

  // TODO: Make response type more specific
  protected override async divineHandler(payloads: Payload[] = []): Promise<Payload[]> {
    const lastState = payloads.find(isModuleState<ImageThumbnailDivinerState>)
    if (!lastState) return []
    const { offset } = lastState.state
    // Get next batch of results
    const boundWitnessDiviner = await this.getBoundWitnessDivinerForStore()
    const query = new PayloadBuilder<BoundWitnessDivinerQueryPayload>({ schema: BoundWitnessDivinerQuerySchema })
      .fields({
        limit: this.payloadDivinerLimit,
        offset,
        order: 'asc',
        payload_schemas: [ImageThumbnailSchema, TimestampSchema],
      })
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
    const nextState: ModuleState<ImageThumbnailDivinerState> = {
      schema: ModuleStateSchema,
      state: {
        offset: batch.length,
      },
    }
    return [nextState, ...indexCandidates.flat()]
  }
  /**
   * Retrieves the archivist for the specified store
   * @param store The store to retrieve the archivist for
   * @returns The archivist for the specified store
   */
  protected async getArchivistForStore() {
    const name = assertEx(this.config?.payloadStore?.archivist, () => `${moduleName}: Config for payloadStore.archivist not specified`)
    const mod = assertEx(await this.resolve(name), () => `${moduleName}: Failed to resolve payloadStore.archivist`)
    return ArchivistWrapper.wrap(mod, this.account)
  }

  /**
   * Retrieves the BoundWitness Diviner for the specified store
   * @param store The store to retrieve the BoundWitness Diviner for
   * @returns The BoundWitness Diviner for the specified store
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
