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
    // Get source data
    const sourceArchivist = await this.getArchivistForStore('thumbnailStore')
    const transformInputs: [BoundWitness, ImageThumbnail, TimeStamp][] = (
      await Promise.all(batch.filter(isBoundWitness).map((bw) => ImageThumbnailDiviner.getPayloadsInBoundWitness(bw, sourceArchivist)))
    ).filter(exists)
    // Transform to index results
    const toIndexTransformDiviner = await this.getTransformDiviner('dataToIndexData')
    const indexes = (await Promise.all(transformInputs.map((input) => toIndexTransformDiviner.divine(input)))).flat().filter(exists)
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

  protected override async divineHandler(payloads: Payload[] = []): Promise<Payload[]> {
    const urls = payloads.filter(isImageThumbnailDivinerQuery)
    const indexDiviner = await this.getPayloadDivinerForStore('indexStore')
    const transformQuery = await this.getTransformDiviner('divinerQueryToIndexQuery')
    const transformResponse = await this.getTransformDiviner('indexResponseToDivinerResponse')
    const results = (
      await Promise.all(
        urls.map(async (divinerQuery) => {
          const indexQuery = await transformQuery.divine([divinerQuery])
          // Divine the results
          const indexedResults = await indexDiviner.divine(indexQuery)
          // Transform the results to the response shape
          const response = await Promise.all(indexedResults.flat().map((indexedResult) => transformResponse.divine([divinerQuery, indexedResult])))
          return response.flat()
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

  protected async getTransformDiviner(transform: 'dataToIndexData' | 'divinerQueryToIndexQuery' | 'indexResponseToDivinerResponse') {
    // TODO: Actually get these from config
    switch (transform) {
      case 'dataToIndexData':
        return await PayloadToImageThumbnailResultIndexTransformDiviner.create()
      case 'divinerQueryToIndexQuery':
        return await DivinerQueryToIndexQueryTransformDiviner.create()
      case 'indexResponseToDivinerResponse':
        return await IndexToResponseTransformDiviner.create()
    }
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

class PayloadToImageThumbnailResultIndexTransformDiviner extends AbstractDiviner {
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
class DivinerQueryToIndexQueryTransformDiviner extends AbstractDiviner {
  static override configSchemas = [DivinerConfigSchema]

  protected override async divineHandler(payloads: Payload[] = []): Promise<ImageThumbnailResultQuery[]> {
    const payload = payloads.find(isImageThumbnailDivinerQuery)
    if (payload) {
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
      return [query]
    }
    return Promise.resolve([])
  }
}

class IndexToResponseTransformDiviner extends AbstractDiviner {
  static override configSchemas = [DivinerConfigSchema]

  protected override divineHandler(payloads: Payload[] = []): Promise<ImageThumbnailResult[]> {
    const imageThumbnailDivinerQuery = payloads.find(isImageThumbnailDivinerQuery)
    const imageThumbnailResultIndex = payloads.find(isImageThumbnailResultIndex)
    if (imageThumbnailDivinerQuery && imageThumbnailResultIndex) {
      const { url } = imageThumbnailDivinerQuery
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { key, schema, ...commonFields } = imageThumbnailResultIndex
      const fields: ImageThumbnailResultFields = { ...commonFields, url }
      return Promise.resolve([new PayloadBuilder<ImageThumbnailResult>({ schema: ImageThumbnailResultSchema }).fields(fields).build()])
    }
    return Promise.resolve([])
  }
}
