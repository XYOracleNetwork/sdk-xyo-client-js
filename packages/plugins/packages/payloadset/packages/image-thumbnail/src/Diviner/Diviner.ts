import { assertEx } from '@xylabs/assert'
import { delay } from '@xylabs/delay'
import { compact } from '@xylabs/lodash'
import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { ArchivistInstance, asArchivistInstance, withArchivistModule } from '@xyo-network/archivist-model'
import { ArchivistWrapper } from '@xyo-network/archivist-wrapper'
import { isBoundWitness } from '@xyo-network/boundwitness-model'
import { EmptyObject, PayloadHasher } from '@xyo-network/core'
import { asDivinerInstance, DivinerConfigSchema, DivinerInstance } from '@xyo-network/diviner-model'
import { PayloadDivinerQueryPayload, PayloadDivinerQuerySchema } from '@xyo-network/diviner-payload-model'
import { DivinerWrapper } from '@xyo-network/diviner-wrapper'
import { ImageThumbnail, ImageThumbnailSchema } from '@xyo-network/image-thumbnail-payload-plugin'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'
import { isUrlPayload, UrlPayload } from '@xyo-network/url-payload-plugin'

import { ImageThumbnailDivinerConfig, ImageThumbnailDivinerConfigSchema } from './Config'
import { ImageThumbnailDivinerParams } from './Params'

/**
 * TODO: Once the shape settles, make a generic payload so that it
 * can be used for other modules
 */
interface State<T extends EmptyObject = EmptyObject> {
  state: T
}

type ImageThumbnailDivinerState = EmptyObject & {
  hash: string
}

const ModuleStateSchema = 'network.xyo.module.state' as const
type ModuleStateSchema = typeof ModuleStateSchema

type ModuleState = Payload<State<ImageThumbnailDivinerState>, ModuleStateSchema>

const isModuleState = isPayloadOfSchemaType<ModuleState>(ModuleStateSchema)

type ConfigStoreKey = 'indexStore' | 'stateStore' | 'thumbnailStore'

type ConfigStore = Extract<keyof ImageThumbnailDivinerConfig, ConfigStoreKey>

const moduleName = 'ImageThumbnailDiviner'
export class ImageThumbnailDiviner<TParams extends ImageThumbnailDivinerParams = ImageThumbnailDivinerParams> extends AbstractDiviner<TParams> {
  static override configSchemas = [ImageThumbnailDivinerConfigSchema, DivinerConfigSchema]

  private _archivistInstance: Promise<ArchivistInstance> | undefined
  private _initializeArchivistConnectionIfNeededPromise: Promise<void> | undefined
  private _map: Record<string, string> | undefined
  private _payloadDivinerInstance: Promise<DivinerInstance> | undefined
  private _pollId?: string | number | NodeJS.Timeout

  // static override get configSchema() {
  //   return ImageThumbnailDivinerConfigSchema
  // }

  get archivist() {
    return this.config.archivist
  }

  get payloadDiviner() {
    return this.config.payloadDiviner
  }

  get payloadDivinerLimit() {
    return this.config.payloadDivinerLimit ?? 10000
  }

  get pollFrequency() {
    return this.config.pollFrequency
  }

  //using promise as mutex
  async getArchivistInstance(): Promise<ArchivistInstance> {
    //if previously checked, but not found, clear promise
    if (this._archivistInstance && !(await this._archivistInstance)) {
      this._archivistInstance = undefined
    }
    this._archivistInstance =
      this._archivistInstance ??
      (async () => {
        const module = this.archivist ? await this.resolve(this.archivist) : undefined
        return asArchivistInstance(module, 'Provided archivist address did not resolve to an Archivist')
      })()
    return this._archivistInstance
  }

  //using promise as mutex
  async getPayloadDivinerInstance(): Promise<DivinerInstance | undefined> {
    const payloadDivinerAddress = this.payloadDiviner
    if (payloadDivinerAddress) {
      //if previously checked, but not found, clear promise
      if (this._payloadDivinerInstance && !(await this._payloadDivinerInstance)) {
        this._payloadDivinerInstance = undefined
      }
      this._payloadDivinerInstance =
        this._payloadDivinerInstance ??
        (async () => {
          const module = await this.resolve(payloadDivinerAddress)
          return asDivinerInstance(module, 'Provided payload diviner address did not resolve to a Diviner')
        })()

      return this._payloadDivinerInstance
    }
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

  protected override async divineHandler(payloads: Payload[] = []): Promise<ImageThumbnail[]> {
    await this.initializeArchivistConnectionIfNeeded()
    const urls = payloads.filter(isUrlPayload).map((urlPayload) => urlPayload.url)
    const map = await this.getSafeMap()
    const archivist = await this.getArchivistInstance()
    const hashes = compact(urls.map((url) => map?.[url]))
    return (await archivist.get(hashes)).filter((payload): payload is ImageThumbnail => payload.schema === ImageThumbnailSchema)
  }

  protected async getArchivistFromConfig(store: ConfigStore, wrap?: boolean) {
    const name = assertEx(this.config?.[store]?.boundWitnessDiviner, () => `${moduleName}: Config for ${store}.archivist not specified`)
    const mod = assertEx(await this.resolve(name), () => `${moduleName}: Failed to resolve ${store}.archivist`)
    return wrap
      ? ArchivistWrapper.wrap(mod, this.account)
      : asArchivistInstance(mod, () => `${moduleName}: ${store}.boundWitnessDiviner is not an Archivist`)
  }

  protected async getBoundWitnessDiviner(store: ConfigStore, wrap?: boolean) {
    const name = assertEx(this.config?.[store]?.boundWitnessDiviner, () => `${moduleName}: Config for ${store}.boundWitnessDiviner not specified`)
    const mod = assertEx(await this.resolve(name), () => `${moduleName}: Failed to resolve ${store}.boundWitnessDiviner`)
    return wrap
      ? DivinerWrapper.wrap(mod, this.account)
      : asDivinerInstance(mod, () => `${moduleName}: ${store}.boundWitnessDiviner is not a Diviner`)
  }

  //using promise as mutex
  protected initializeArchivistConnectionIfNeeded() {
    this._initializeArchivistConnectionIfNeededPromise =
      this._initializeArchivistConnectionIfNeededPromise ??
      (async () => {
        if (!this._map) {
          await this.attachArchivistEvents()
          console.log('initializeArchivistConnectionIfNeeded: attachArchivistEvents done')
          await this.poll()
          console.log('initializeArchivistConnectionIfNeeded: poll done')
        }
      })()
    return this._initializeArchivistConnectionIfNeededPromise
  }

  protected async loadMap() {
    if (this.payloadDiviner) {
      return await this.loadMapWithPayloadDiviner()
    } else {
      return await this.loadMapWithAll()
    }
  }

  protected async loadMapWithAll() {
    if (await this.started()) {
      const archivist = await this.getArchivistInstance()
      assertEx(archivist.all, "Archivist does not support 'all'")
      const allPayloads = (await archivist.all?.()) ?? []
      const imagePayloadPairs = await Promise.all(
        allPayloads
          .filter((payload): payload is ImageThumbnail => payload.schema === ImageThumbnailSchema)
          .map<Promise<[string, ImageThumbnail]>>(async (payload) => [await PayloadHasher.hashAsync(payload), payload]),
      )
      this._map = imagePayloadPairs.reduce<Record<string, string>>((prev, [hash, payload]) => {
        prev[payload.sourceUrl] = hash
        return prev
      }, {})
    }
  }

  protected async loadMapWithPayloadDiviner() {
    console.log('loadMapWithPayloadDiviner: started')
    if (await this.started()) {
      const diviner = await this.getPayloadDivinerInstance()
      let offset: number | undefined = undefined
      let moreAvailable = true
      if (diviner) {
        const newMap: Record<string, string> = {}
        while (moreAvailable) {
          const payloadDivinerQuery: PayloadDivinerQueryPayload = {
            limit: this.payloadDivinerLimit,
            offset,
            schema: PayloadDivinerQuerySchema,
            schemas: [ImageThumbnailSchema],
          }
          const payloads = await diviner.divine([payloadDivinerQuery])
          offset = (offset ?? 0) + payloads.length
          moreAvailable = payloads.length > 0
          console.log(`loadMapWithPayloadDiviner.offset: ${offset}`)
          console.log(`loadMapWithPayloadDiviner.moreAvailable: ${moreAvailable}`)
          const imagePayloadPairs = await Promise.all(
            payloads
              .filter((payload): payload is ImageThumbnail => payload.schema === ImageThumbnailSchema)
              .map<Promise<[string, ImageThumbnail]>>(async (payload) => [await PayloadHasher.hashAsync(payload), payload]),
          )
          imagePayloadPairs.forEach(([hash, payload]) => (newMap[payload.sourceUrl] = hash))
        }
        this._map = newMap
      }
    }
  }

  /**
   * Retrieves the last state of the Diviner process. Used to recover state after
   * preemptions, reboots, etc.
   */
  protected async retrieveState(): Promise<ImageThumbnailDivinerState | undefined> {
    let hash: string = ''
    const diviner = await this.getBoundWitnessDiviner('stateStore')
    const query = new PayloadBuilder<PayloadDivinerQueryPayload>({ schema: PayloadDivinerQuerySchema }).fields({
      address: this.account.address,
      limit: 1,
      offset: 0,
      order: 'desc',
      schemas: [ImageThumbnailSchema],
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

  protected override async stopHandler(_timeout?: number | undefined): Promise<boolean> {
    if (this._pollId) {
      clearTimeout(this._pollId)
      this._pollId = undefined
    }
    return await super.stopHandler()
  }

  private async attachArchivistEvents() {
    const archivist = await this.getArchivistInstance()
    const mapPromise = this.getSafeMap()
    archivist.on('inserted', async ({ payloads }) => {
      const map = await mapPromise
      const thumbnails = compact(payloads.filter((payload): payload is ImageThumbnail => payload.schema === ImageThumbnailSchema))
      await Promise.all(thumbnails.map(async (payload) => (map[payload.sourceUrl] = await PayloadHasher.hashAsync(payload))))
    })
  }

  private async getSafeMap() {
    let mapRetry = 100 //10 seconds max
    let map = this._map
    while (!map) {
      await delay(100)
      mapRetry = mapRetry - 1
      if (mapRetry === 0) {
        throw Error('Map Not Loaded')
      }
      map = this._map
    }
    return map
  }

  private async poll() {
    if (await this.started()) {
      const pollFrequency = this.pollFrequency
      if (pollFrequency) {
        this._pollId = setTimeout(async () => {
          this._pollId = undefined
          await this.loadMap()
          await this.poll()
        }, pollFrequency)
      } else {
        await this.loadMap()
      }
    }
  }
}
