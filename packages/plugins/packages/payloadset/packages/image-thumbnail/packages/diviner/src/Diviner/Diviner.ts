import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { ArchivistInstance } from '@xyo-network/archivist-model'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { BoundWitness, isBoundWitness } from '@xyo-network/boundwitness-model'
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
  ImageThumbnailResultFields,
  ImageThumbnailResultIndex,
  ImageThumbnailResultIndexFields,
  ImageThumbnailResultIndexSchema,
  ImageThumbnailResultSchema,
  ImageThumbnailSchema,
  isImageThumbnail,
  isImageThumbnailDivinerQuery,
  isImageThumbnailResult,
  isImageThumbnailResultIndex,
} from '@xyo-network/image-thumbnail-payload-plugin'
import { isModuleState, ModuleState, ModuleStateSchema, StateDictionary } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'
import { UrlSchema } from '@xyo-network/url-payload-plugin'
import { isTimestamp, TimeStamp, TimestampSchema } from '@xyo-network/witness-timestamp'

export type ImageThumbnailDivinerState = StateDictionary & {
  offset: number
}

type ConfigStoreKey = 'indexStore' | 'stateStore' | 'thumbnailStore'

type ConfigStore = Extract<keyof ImageThumbnailDivinerConfig, ConfigStoreKey>

/**
 * The fields that will need to be indexed on in the underlying store
 */
type QueryableImageThumbnailResultProperties = Extract<keyof ImageThumbnailResultIndex, 'status' | 'success' | 'timestamp' | 'key'>

/**
 * The query that will be used to retrieve the results from the underlying store
 */
type ImageThumbnailResultQuery = PayloadDivinerQueryPayload & Pick<ImageThumbnailResultIndex, QueryableImageThumbnailResultProperties>

type IndexableHashes = Readonly<[boundWitnessHash: string, imageThumbnailHash: string, timestampHash: string]>

const moduleName = 'ImageThumbnailDiviner'

export class ImageThumbnailDiviner<TParams extends ImageThumbnailDivinerParams = ImageThumbnailDivinerParams> extends AbstractDiviner<TParams> {
  static override configSchemas = [ImageThumbnailDivinerConfigSchema, DivinerConfigSchema]

  private _lastState?: ImageThumbnailDivinerState
  private _pollId?: string | number | NodeJS.Timeout

  get payloadDivinerLimit() {
    return this.config.payloadDivinerLimit ?? 1_0000
  }

  get pollFrequency() {
    return this.config.pollFrequency ?? 10_000
  }

  /**
   * Finds all the IndexableData associated with the IndexableHashes, for all hashes which could be retrieved.
   * @param indexableHashes The IndexableHashes to retrieve
   * @param archivist The Archivist to retrieve the IndexableData from
   * @returns The IndexableData referenced by the IndexableHashes, for all hashes which could be retrieved.
   */
  private static async findIndexableData(indexableHashes: IndexableHashes[], archivist: ArchivistInstance) {
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
          if (!imageThumbnailPayload) {
            console.log(
              `${moduleName}: Could not find ${ImageThumbnailSchema} Payload (${imageThumbnailHash}) from BoundWitness (${boundWitnessHash})`,
            )
            return undefined
          }
          const timestampPayload = results.find(isTimestamp)
          if (!timestampPayload) {
            console.log(`${moduleName}: Could not find ${TimestampSchema} Payload (${timestampHash}) from BoundWitness (${boundWitnessHash})`)
            return undefined
          }
          const calculatedImageThumbnailHash = await PayloadHasher.hashAsync(imageThumbnailPayload)
          const calculatedTimestampHash = await PayloadHasher.hashAsync(timestampPayload)
          if (imageThumbnailHash !== calculatedImageThumbnailHash || timestampHash !== calculatedTimestampHash) return undefined
          return [boundWitnessHash, imageThumbnailHash, imageThumbnailPayload, timestampHash, timestampPayload] as const
        }),
      )
    ).filter(exists)
    return indexableData
  }

  /**
   * Maps an BoundWitness containing an ImageThumbnail & Timestamp payload to an array of IndexableHashes
   * @param batch The batch of BoundWitnesses from the source archivist
   * @returns An array of IndexableHashes constructed from the batch of BoundWitness
   */
  private static async indexableHashes(batch: Payload[]) {
    // Find all the indexable hashes in this batch
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
          return imageThumbnails.map<IndexableHashes>((imageThumbnailHash) => [boundWitnessHash, imageThumbnailHash, timestampHash] as const)
        }),
      )
    )
      .flat()
      .filter(exists)
    return indexableHashes
  }

  /**
   * Works via batched iteration of the source archivist to populate the index.
   * @returns A promise that resolves when the background process is complete
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
    const indexableHashes = await ImageThumbnailDiviner.indexableHashes(batch)
    const archivist = await this.getArchivistForStore('thumbnailStore')
    const indexableData = await ImageThumbnailDiviner.findIndexableData(indexableHashes, archivist)
    // Build index results from the indexable data
    const indexes: ImageThumbnailResultIndex[] = await Promise.all(
      indexableData.map(async ([boundWitnessHash, thumbnailHash, thumbnailPayload, timestampHash, timestampPayload]) => {
        const { sourceUrl: url } = thumbnailPayload
        const { timestamp } = timestampPayload
        const status = thumbnailPayload.http?.status
        //call anything with a thumbnail url a success
        const success = !!thumbnailPayload.url
        const sources = [boundWitnessHash, thumbnailHash, timestampHash]
        const urlPayload = { schema: UrlSchema, url }
        const key = await PayloadHasher.hashAsync(urlPayload)
        const fields: ImageThumbnailResultIndexFields = { key, sources, status, success, timestamp }
        return new PayloadBuilder<ImageThumbnailResultIndex>({ schema: ImageThumbnailResultIndexSchema }).fields(fields).build()
      }),
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
   * @param state The state to commit
   */
  protected async commitState(state: ImageThumbnailDivinerState) {
    this._lastState = state
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
          // Sanitize the query
          const { limit: payloadLimit, offset: payloadOffset, order: payloadOrder, status: payloadStatus, success: payloadSuccess, url } = payload
          const limit = payloadLimit ?? 1
          const order = payloadOrder ?? 'desc'
          const offset = payloadOffset ?? 0
          const urlPayload = { schema: UrlSchema, url }
          const key = await PayloadHasher.hashAsync(urlPayload)
          const fields: Partial<ImageThumbnailResultQuery> = { key, limit, offset, order }
          if (payloadSuccess !== undefined) fields.success = payloadSuccess
          if (payloadStatus !== undefined) fields.status = payloadStatus
          const query = new PayloadBuilder<ImageThumbnailResultQuery>({ schema: PayloadDivinerQuerySchema }).fields(fields).build()
          // Divine the results
          const results = await diviner.divine([query])
          // Convert hash-indexed results to public representation
          return results.filter(isImageThumbnailResultIndex).map<ImageThumbnailResult>((imageThumbnailResultIndex) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { key, schema, ...commonFields } = imageThumbnailResultIndex
            const fields: ImageThumbnailResultFields = { ...commonFields, url }
            return new PayloadBuilder<ImageThumbnailResult>({ schema: ImageThumbnailResultSchema }).fields(fields).build()
          })
        }),
      )
    )
      .flat()
      .filter(isImageThumbnailResult)
    return results
  }

  /**
   * Retrieves the archivist for the specified store
   * @param store The store to retrieve the archivist for
   * @returns The archivist for the specified store
   */
  protected async getArchivistForStore(store: ConfigStore) {
    const name = assertEx(this.config?.[store]?.archivist, () => `${moduleName}: Config for ${store}.archivist not specified`)
    const mod = assertEx(await this.resolve(name), () => `${moduleName}: Failed to resolve ${store}.archivist`)
    return ArchivistWrapper.wrap(mod, this.account)
  }

  /**
   * Retrieves the BoundWitness Diviner for the specified store
   * @param store The store to retrieve the BoundWitness Diviner for
   * @returns The BoundWitness Diviner for the specified store
   */
  protected async getBoundWitnessDivinerForStore(store: ConfigStore) {
    const name = assertEx(this.config?.[store]?.boundWitnessDiviner, () => `${moduleName}: Config for ${store}.boundWitnessDiviner not specified`)
    const mod = assertEx(await this.resolve(name), () => `${moduleName}: Failed to resolve ${store}.boundWitnessDiviner`)
    return DivinerWrapper.wrap(mod, this.account)
  }

  /**
   * Retrieves the Payload Diviner for the specified store
   * @param store The store to retrieve the Payload Diviner for
   * @returns The Payload Diviner for the specified store
   */
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
    if (this._lastState) return this._lastState
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

  /**
   * Runs the background divine process on a loop with a delay
   * specified by the `config.pollFrequency`
   */
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

export class PayloadToImageThumbnailResultTransformDiviner extends AbstractDiviner {
  static override configSchemas = [DivinerConfigSchema]

  protected override async divineHandler(payloads: Payload[] = []): Promise<ImageThumbnailResult[]> {
    const bw: BoundWitness | undefined = payloads.find(isBoundWitness)
    const imageThumbnailPayload: ImageThumbnail | undefined = payloads.find(isImageThumbnail)
    const timestampPayload: TimeStamp | undefined = payloads.find(isTimestamp)
    if (bw && imageThumbnailPayload && timestampPayload) {
      const { sourceUrl: url } = imageThumbnailPayload
      const { timestamp } = timestampPayload
      const status = imageThumbnailPayload.http?.status
      const success = !!imageThumbnailPayload.url // Call anything with a thumbnail url a success
      const sources = (await PayloadHasher.hashPairs([bw, imageThumbnailPayload, timestampPayload])).map(([, hash]) => hash)
      const fields: ImageThumbnailResultFields = { sources, success, timestamp, url }
      if (status) fields.status = status
      const result: ImageThumbnailResult = new PayloadBuilder<ImageThumbnailResult>({ schema: ImageThumbnailResultSchema }).fields(fields).build()
      return [result]
    }
    return Promise.resolve([])
  }
}
export class PayloadToImageThumbnailResultIndexTransformDiviner extends AbstractDiviner {
  static override configSchemas = [DivinerConfigSchema]

  protected override async divineHandler(payloads: Payload[] = []): Promise<ImageThumbnailResultIndex[]> {
    const bw: BoundWitness | undefined = payloads.find(isBoundWitness)
    const imageThumbnailPayload: ImageThumbnail | undefined = payloads.find(isImageThumbnail)
    const timestampPayload: TimeStamp | undefined = payloads.find(isTimestamp)
    if (bw && imageThumbnailPayload && timestampPayload) {
      const { sourceUrl: url } = imageThumbnailPayload
      const { timestamp } = timestampPayload
      const status = imageThumbnailPayload.http?.status
      const success = !!imageThumbnailPayload.url // Call anything with a thumbnail url a success
      const sources = (await PayloadHasher.hashPairs([bw, imageThumbnailPayload, timestampPayload])).map(([, hash]) => hash)
      const urlPayload = { schema: UrlSchema, url }
      const key = await PayloadHasher.hashAsync(urlPayload)
      const fields: ImageThumbnailResultIndexFields = { key, sources, success, timestamp }
      if (status) fields.status = status
      const result: ImageThumbnailResultIndex = new PayloadBuilder<ImageThumbnailResultIndex>({ schema: ImageThumbnailResultIndexSchema })
        .fields(fields)
        .build()
      return [result]
    }
    return Promise.resolve([])
  }
}
