import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { isBoundWitness } from '@xyo-network/boundwitness-model'
import { PayloadHasher } from '@xyo-network/core'
import { BoundWitnessDivinerQueryPayload, BoundWitnessDivinerQuerySchema } from '@xyo-network/diviner-boundwitness-model'
import { DivinerConfigSchema } from '@xyo-network/diviner-model'
import { PayloadDivinerQueryPayload, PayloadDivinerQuerySchema } from '@xyo-network/diviner-payload-model'
import { DivinerWrapper } from '@xyo-network/diviner-wrapper'
import {
  ImageThumbnail,
  ImageThumbnailDivinerConfig,
  ImageThumbnailDivinerConfigSchema,
  ImageThumbnailDivinerParams,
  ImageThumbnailResult,
  ImageThumbnailResultIndexSchema,
  ImageThumbnailResultInfo,
  ImageThumbnailSchema,
  isImageThumbnail,
  isImageThumbnailDivinerQuery,
  isImageThumbnailResult,
} from '@xyo-network/image-thumbnail-payload-plugin'
import { isModuleState, ModuleState, ModuleStateSchema, StateDictionary } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'
import { isTimestamp, TimeStamp, TimestampSchema } from '@xyo-network/witness-timestamp'

export type ImageThumbnailDivinerState = StateDictionary & {
  offset: number
}

type ConfigStoreKey = 'indexStore' | 'stateStore' | 'thumbnailStore'

type ConfigStore = Extract<keyof ImageThumbnailDivinerConfig, ConfigStoreKey>

/**
 * The fields that will need to be indexed on in the underlying store
 */
type QueryableImageThumbnailResultProperties = Extract<keyof ImageThumbnailResultInfo, 'status' | 'success' | 'timestamp' | 'url'>

/**
 * The query that will be used to retrieve the results from the underlying store
 */
type ImageThumbnailResultQuery = PayloadDivinerQueryPayload & { schemas: [ImageThumbnailSchema] } & Pick<
    ImageThumbnailResult,
    QueryableImageThumbnailResultProperties
  >

const moduleName = 'ImageThumbnailDiviner'

export class ImageThumbnailDiviner<TParams extends ImageThumbnailDivinerParams = ImageThumbnailDivinerParams> extends AbstractDiviner<TParams> {
  static override configSchemas = [ImageThumbnailDivinerConfigSchema, DivinerConfigSchema]

  private _pollId?: string | number | NodeJS.Timeout

  get payloadDivinerLimit() {
    return this.config.payloadDivinerLimit ?? 1_0000
  }

  get pollFrequency() {
    return this.config.pollFrequency ?? 10_000
  }

  /**
   * Works in the background to populate index for the Diviner
   * @returns
   */
  protected backgroundDivine = async (): Promise<void> => {
    // Load last state
    const lastState = (await this.retrieveState()) ?? { offset: 0 }
    const { offset } = lastState
    // Get next batch of results
    const boundWitnessDiviner = await this.getBoundWitnessDivinerForStore('thumbnailStore')
    const query = new PayloadBuilder<BoundWitnessDivinerQueryPayload>({ schema: BoundWitnessDivinerQuerySchema })
      .fields({
        limit: this.payloadDivinerLimit,
        offset,
        order: 'asc',
        payload_schemas: [ImageThumbnailSchema, TimestampSchema],
      })
      .build()
    const batch = await boundWitnessDiviner.divine([query])
    if (batch.length === 0) return
    // Find all the indexable hashes in this batch
    type IndexableHashes = Readonly<[boundWitnessHash: string, imageThumbnailHash: string, timestampHash: string]>
    const indexableHashes: IndexableHashes[] = (
      await Promise.all(
        batch.filter(isBoundWitness).map(async (bw) => {
          const imageThumbnailIndexes = bw.payload_schemas
            ?.map((schema, index) => (schema === ImageThumbnailSchema ? index : undefined))
            .filter(exists)
          const timestampIndex = bw.payload_schemas?.findIndex((schema) => schema === TimestampSchema)
          if (!imageThumbnailIndexes.length || timestampIndex === -1) return undefined
          const imageThumbnails = bw.payload_hashes.map((hash, index) => (imageThumbnailIndexes.includes(index) ? hash : undefined)).filter(exists)
          const timestampHash = bw.payload_hashes?.[timestampIndex]
          const boundWitnessHash = await PayloadHasher.hashAsync(bw)
          return imageThumbnails.map((imageThumbnailHash) => [boundWitnessHash, imageThumbnailHash, timestampHash] as const)
        }),
      )
    )
      .flat()
      .filter(exists)
    const archivist = await this.getArchivistForStore('thumbnailStore')
    // Find all the indexable data associated with the indexable hashes
    type IndexableData = Readonly<
      [
        boundWitnessHash: string,
        imageThumbnailHash: string,
        imageThumbnailPayload: ImageThumbnail,
        timestampHash: string,
        timestampPayload: TimeStamp,
      ]
    >
    const indexableData: IndexableData[] = (
      await Promise.all(
        indexableHashes.map(async ([boundWitnessHash, imageThumbnailHash, timestampHash]) => {
          const results = await archivist.get([imageThumbnailHash, timestampHash])
          const imageThumbnailPayload = results.find(isImageThumbnail)
          const timestampPayload = results.find(isTimestamp)
          if (!imageThumbnailPayload || !timestampPayload) {
            console.log('Could not find payload from hash to index')
            return undefined
          }
          const calculatedImageThumbnailHash = await PayloadHasher.hashAsync(imageThumbnailPayload)
          const calculatedTimestampHash = await PayloadHasher.hashAsync(timestampPayload)
          if (imageThumbnailHash !== calculatedImageThumbnailHash || timestampHash !== calculatedTimestampHash) return undefined
          return [boundWitnessHash, imageThumbnailHash, imageThumbnailPayload, timestampHash, timestampPayload] as const
        }),
      )
    ).filter(exists)
    // Build index results from the indexable data
    const indexes: ImageThumbnailResult[] = indexableData.map(
      ([boundWitnessHash, thumbnailHash, thumbnailPayload, timestampHash, timestampPayload]) => {
        const { sourceUrl: url } = thumbnailPayload
        const { timestamp } = timestampPayload
        const status = thumbnailPayload.http?.status
        const success = thumbnailPayload.http?.status ? true : false
        const sources = [boundWitnessHash, thumbnailHash, timestampHash]
        const fields = status ? { sources, status, success, timestamp, url } : { sources, success, timestamp, url }
        const result = new PayloadBuilder<ImageThumbnailResult>({ schema: ImageThumbnailResultIndexSchema }).fields(fields).build()
        return result
      },
    )
    // Insert index results
    const indexArchivist = await this.getArchivistForStore('indexStore')
    await indexArchivist.insert(indexes)
    // Update state
    const nextOffset = offset + batch.length
    const currentState = { ...lastState, offset: nextOffset }
    await this.commitState(currentState)
  }

  /**
   * Commit the internal state of the Diviner process. This is similar
   * to a transaction completion in a database and should only be called
   * when results have been successfully persisted to the appropriate
   * external stores.
   */
  protected async commitState(state: ImageThumbnailDivinerState) {
    const archivist = await this.getArchivistForStore('stateStore')
    const payload = new PayloadBuilder<ModuleState<ImageThumbnailDivinerState>>({ schema: ModuleStateSchema }).fields({ state }).build()
    const [bw] = await new BoundWitnessBuilder().payloads([payload]).witness(this.account).build()
    await archivist.insert([bw, payload])
  }

  protected override async divineHandler(payloads: Payload[] = []): Promise<ImageThumbnailResult[]> {
    const urls = payloads.filter(isImageThumbnailDivinerQuery)
    const diviner = await this.getPayloadDivinerForStore('indexStore')
    const results = (
      await Promise.all(
        urls.map(async (payload) => {
          const { limit: payloadLimit, offset: payloadOffset, order: payloadOrder, status: payloadStatus, success: payloadSuccess, url } = payload
          const limit = payloadLimit ?? 1
          const order = payloadOrder ?? 'desc'
          const offset = payloadOffset ?? 0
          const success = payloadSuccess
          const fields: Partial<ImageThumbnailResultQuery> = { limit, offset, order, success, url }
          // Default to filtering on 200 status code if success was not supplied
          if (payloadSuccess === true) fields.status = payloadStatus ?? 200
          // If success is true and status was supplied, use it
          if (success === true && payloadStatus !== undefined) fields.status = payloadStatus
          const query = new PayloadBuilder<ImageThumbnailResultQuery>({ schema: PayloadDivinerQuerySchema }).fields(fields).build()
          return await diviner.divine([query])
        }),
      )
    )
      .flat()
      .filter(isImageThumbnailResult)
    return results
  }

  protected async getArchivistForStore(store: ConfigStore) {
    const name = assertEx(this.config?.[store]?.archivist, () => `${moduleName}: Config for ${store}.archivist not specified`)
    const mod = assertEx(await this.resolve(name), () => `${moduleName}: Failed to resolve ${store}.archivist`)
    return ArchivistWrapper.wrap(mod, this.account)
  }

  protected async getBoundWitnessDivinerForStore(store: ConfigStore) {
    const name = assertEx(this.config?.[store]?.boundWitnessDiviner, () => `${moduleName}: Config for ${store}.boundWitnessDiviner not specified`)
    const mod = assertEx(await this.resolve(name), () => `${moduleName}: Failed to resolve ${store}.boundWitnessDiviner`)
    return DivinerWrapper.wrap(mod, this.account)
  }

  protected async getPayloadDivinerForStore(store: ConfigStore) {
    const name = assertEx(this.config?.[store]?.payloadDiviner, () => `${moduleName}: Config for ${store}.payloadDiviner not specified`)
    const mod = assertEx(await this.resolve(name), () => `${moduleName}: Failed to resolve ${store}.payloadDiviner`)
    return DivinerWrapper.wrap(mod, this.account)
  }

  /**
   * Retrieves the last state of the Diviner process. Used to recover state after
   * preemptions, reboots, etc.
   */
  protected async retrieveState(): Promise<ImageThumbnailDivinerState | undefined> {
    let hash: string = ''
    const diviner = await this.getBoundWitnessDivinerForStore('stateStore')
    const query = new PayloadBuilder<BoundWitnessDivinerQueryPayload>({ schema: BoundWitnessDivinerQuerySchema })
      .fields({
        address: this.account.address,
        limit: 1,
        offset: 0,
        order: 'desc',
        payload_schemas: [ModuleStateSchema],
      })
      .build()
    const boundWitnesses = await diviner.divine([query])
    if (boundWitnesses.length > 0) {
      const boundWitness = boundWitnesses[0]
      if (isBoundWitness(boundWitness)) {
        // Find the index for this address in the BoundWitness that is a ModuleState
        hash = boundWitness.addresses
          .map((address, index) => ({ address, index }))
          .filter(({ address }) => address === this.account.address)
          .reduce(
            (prev, curr) => (boundWitness.payload_schemas?.[curr?.index] === ModuleStateSchema ? boundWitness.payload_hashes[curr?.index] : prev),
            '',
          )
      }
    }

    // If we able to located the last state
    if (hash) {
      // Get last state
      const archivist = await this.getArchivistForStore('stateStore')
      const payload = (await archivist.get([hash])).find(isModuleState)
      if (payload) {
        return payload.state as ImageThumbnailDivinerState
      }
    }
    return undefined
  }

  protected override async startHandler(): Promise<boolean> {
    await super.startHandler()
    this.poll()
    return true
  }

  protected override async stopHandler(_timeout?: number | undefined): Promise<boolean> {
    if (this._pollId) {
      clearTimeout(this._pollId)
      this._pollId = undefined
    }
    return await super.stopHandler()
  }

  private poll() {
    this._pollId = setTimeout(async () => {
      try {
        await this.backgroundDivine()
      } catch (e) {
        console.log(e)
      } finally {
        if (this._pollId) clearTimeout(this._pollId)
        this._pollId = undefined
        this.poll()
      }
    }, this.pollFrequency)
  }
}
