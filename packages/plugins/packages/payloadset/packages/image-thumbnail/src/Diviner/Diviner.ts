import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { asArchivistInstance, withArchivistModule } from '@xyo-network/archivist-model'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { isBoundWitness } from '@xyo-network/boundwitness-model'
import { PayloadHasher } from '@xyo-network/core'
import { BoundWitnessDivinerQueryPayload, BoundWitnessDivinerQuerySchema } from '@xyo-network/diviner-boundwitness-model'
import { asDivinerInstance, DivinerConfigSchema } from '@xyo-network/diviner-model'
import { PayloadDivinerQueryPayload, PayloadDivinerQuerySchema } from '@xyo-network/diviner-payload-model'
import { DivinerWrapper } from '@xyo-network/diviner-wrapper'
import { ImageThumbnailSchema, isImageThumbnail } from '@xyo-network/image-thumbnail-payload-plugin'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'
import { isUrlPayload } from '@xyo-network/url-payload-plugin'
import { isTimestamp, TimestampSchema } from '@xyo-network/witness-timestamp'

import { ImageThumbnailDivinerConfig, ImageThumbnailDivinerConfigSchema } from './Config'
import { ImageThumbnailDivinerParams } from './Params'

/**
 * TODO: Once the shape settles, make a generic payload so that it
 * can be used for other modules
 */
interface State<T> {
  state: T
}

interface ImageThumbnailDivinerState {
  offset: number
}

const ModuleStateSchema = 'network.xyo.module.state' as const
type ModuleStateSchema = typeof ModuleStateSchema

type ModuleState = Payload<State<ImageThumbnailDivinerState>, ModuleStateSchema>

const isModuleState = isPayloadOfSchemaType<ModuleState>(ModuleStateSchema)

type ConfigStoreKey = 'indexStore' | 'stateStore' | 'thumbnailStore'

type ConfigStore = Extract<keyof ImageThumbnailDivinerConfig, ConfigStoreKey>

const ImageThumbnailResultIndexSchema = `${ImageThumbnailSchema}.index` as const
type ImageThumbnailResultIndexSchema = typeof ImageThumbnailResultIndexSchema

interface ImageThumbnailResultInfo {
  sources: string[]
  // TODO: Something richer than HTTP status code that allows for info about failure modes
  status: number
  timestamp: number
  url: string
}

type ImageThumbnailResult = Payload<ImageThumbnailResultInfo, ImageThumbnailResultIndexSchema>

const isImageThumbnailResult = isPayloadOfSchemaType<ImageThumbnailResult>(ImageThumbnailResultIndexSchema)

/**
 * The fields that will need to be indexed on in the underlying store
 */
type QueryableImageThumbnailResultProperties = Extract<keyof ImageThumbnailResult, 'url' | 'timestamp' | 'status'>

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

  protected backgroundDivine = async (): Promise<void> => {
    // Load last state
    const lastState = (await this.retrieveState()) ?? { offset: 0 }
    const { offset } = lastState
    // Get next batch of results
    const boundWitnessDiviner = await this.getBoundWitnessDivinerForStore('thumbnailStore')
    const query = new PayloadBuilder<BoundWitnessDivinerQueryPayload>({ schema: BoundWitnessDivinerQuerySchema }).fields({
      limit: this.payloadDivinerLimit,
      offset,
      order: 'asc',
      payload_schemas: [ImageThumbnailSchema, TimestampSchema],
    })
    const batch = await boundWitnessDiviner.divine([query])
    if (batch.length === 0) return
    const imageThumbnailTimestampTuples = batch
      .filter(isBoundWitness)
      .map((bw) => {
        const imageThumbnailIndexes = bw.payload_schemas?.map((schema, index) => (schema === ImageThumbnailSchema ? index : undefined)).filter(exists)
        const timestampIndex = bw.payload_schemas?.findIndex((schema) => schema === TimestampSchema)
        if (!imageThumbnailIndexes.length || timestampIndex === -1) return undefined
        const imageThumbnails = bw.payload_hashes.map((hash, index) => (imageThumbnailIndexes.includes(index) ? hash : undefined)).filter(exists)
        const timestamp = bw.payload_hashes?.[timestampIndex]
        return imageThumbnails.map((imageThumbnail) => [imageThumbnail, timestamp] as const)
      })
      .flat()
      .filter(exists)
    const archivist = await this.getArchivistForStore('thumbnailStore')
    const payloadTuples = (
      await Promise.all(
        imageThumbnailTimestampTuples.map(async ([imageThumbnailHash, timestampHash]) => {
          const results = await archivist.get([imageThumbnailHash, timestampHash])
          const imageThumbnailPayload = results.find(isImageThumbnail)
          const timestampPayload = results.find(isTimestamp)
          if (!imageThumbnailPayload || !timestampPayload) return undefined
          const calculatedImageThumbnailHash = await PayloadHasher.hashAsync(imageThumbnailPayload)
          const calculatedTimestampHash = await PayloadHasher.hashAsync(timestampPayload)
          if (imageThumbnailHash !== calculatedImageThumbnailHash || timestampHash !== calculatedTimestampHash) return undefined
          return [imageThumbnailHash, imageThumbnailPayload, timestampHash, timestampPayload] as const
        }),
      )
    ).filter(exists)
    // Build index results
    const indexedResults = payloadTuples.map(([thumbnailHash, thumbnailPayload, timestampHash, timestampPayload]) => {
      const { sourceUrl: url } = thumbnailPayload
      const { timestamp } = timestampPayload
      const status = thumbnailPayload.http?.status ?? -1
      const sources = [thumbnailHash, timestampHash]
      const result = new PayloadBuilder<ImageThumbnailResult>({ schema: ImageThumbnailResultIndexSchema })
        .fields({ sources, status, timestamp, url })
        .build()
      return result
    })
    // Insert index results
    const indexArchivist = await this.getArchivistForStore('indexStore')
    await indexArchivist.insert(indexedResults)
    // Update state
    const nextOffset = offset + batch.length + 1
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
    const stateStore = assertEx(this.config.stateStore?.archivist, `${moduleName}: No stateStore configured`)
    const module = assertEx(await this.resolve(stateStore), `${moduleName}: Failed to resolve stateStore`)
    await withArchivistModule(module, async (archivist) => {
      const mod = ArchivistWrapper.wrap(archivist, this.account)
      const payload = new PayloadBuilder<ModuleState>({ schema: ModuleStateSchema }).fields({ state }).build()
      await mod.insert([payload])
    })
  }

  protected override async divineHandler(payloads: Payload[] = []): Promise<ImageThumbnailResult[]> {
    const urls = payloads.filter(isUrlPayload).map((urlPayload) => urlPayload.url)
    const diviner = await this.getPayloadDivinerForStore('indexStore')
    const results = (
      await Promise.all(
        urls.map(async (url) => {
          const query = new PayloadBuilder<ImageThumbnailResultQuery>({ schema: PayloadDivinerQuerySchema })
            // TODO: Expose status, limit (and possibly offset) to caller.  Currently only exposing URL
            .fields({ limit: 1, offset: 0, order: 'desc', url })
            .build()
          return await diviner.divine([query])
        }),
      )
    )
      .flat()
      .filter(isImageThumbnailResult)
    return results
  }

  protected async getArchivistForStore(store: ConfigStore, wrap?: boolean) {
    const name = assertEx(this.config?.[store]?.archivist, () => `${moduleName}: Config for ${store}.archivist not specified`)
    const mod = assertEx(await this.resolve(name), () => `${moduleName}: Failed to resolve ${store}.archivist`)
    return wrap ? ArchivistWrapper.wrap(mod, this.account) : asArchivistInstance(mod, () => `${moduleName}: ${store}.archivist is not an Archivist`)
  }

  protected async getBoundWitnessDivinerForStore(store: ConfigStore, wrap?: boolean) {
    const name = assertEx(this.config?.[store]?.boundWitnessDiviner, () => `${moduleName}: Config for ${store}.boundWitnessDiviner not specified`)
    const mod = assertEx(await this.resolve(name), () => `${moduleName}: Failed to resolve ${store}.boundWitnessDiviner`)
    return wrap
      ? DivinerWrapper.wrap(mod, this.account)
      : asDivinerInstance(mod, () => `${moduleName}: ${store}.boundWitnessDiviner is not a Diviner`)
  }

  protected async getPayloadDivinerForStore(store: ConfigStore, wrap?: boolean) {
    const name = assertEx(this.config?.[store]?.payloadDiviner, () => `${moduleName}: Config for ${store}.payloadDiviner not specified`)
    const mod = assertEx(await this.resolve(name), () => `${moduleName}: Failed to resolve ${store}.payloadDiviner`)
    return wrap ? DivinerWrapper.wrap(mod, this.account) : asDivinerInstance(mod, () => `${moduleName}: ${store}.payloadDiviner is not a Diviner`)
  }

  /**
   * Retrieves the last state of the Diviner process. Used to recover state after
   * preemptions, reboots, etc.
   */
  protected async retrieveState(): Promise<ImageThumbnailDivinerState | undefined> {
    let hash: string = ''
    const diviner = await this.getBoundWitnessDivinerForStore('stateStore')
    const query = new PayloadBuilder<BoundWitnessDivinerQueryPayload>({ schema: BoundWitnessDivinerQuerySchema }).fields({
      address: this.account.address,
      limit: 1,
      offset: 0,
      order: 'desc',
      payload_schemas: [ModuleStateSchema],
    })
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
      const stateStoreArchivist = assertEx(this.config.stateStore?.archivist, `${moduleName}: No stateStore archivist configured`)
      await withArchivistModule(
        assertEx(await this.resolve(stateStoreArchivist), `${moduleName}: Failed to resolve stateStore archivist`),
        async (mod) => {
          const archivist = ArchivistWrapper.wrap(mod, this.account)
          const payloads = await archivist.get([hash])
          if (payloads.length > 0) {
            const payload = payloads[0]
            if (isModuleState(payload)) {
              return payload.state
            }
          }
        },
      )
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
