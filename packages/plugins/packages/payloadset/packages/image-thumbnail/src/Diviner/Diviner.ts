import { assertEx } from '@xylabs/assert'
import { delay } from '@xylabs/delay'
import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { ArchivistInstance, asArchivistInstance } from '@xyo-network/archivist-model'
import { PayloadHasher } from '@xyo-network/core'
import { asDivinerInstance, DivinerConfigSchema, DivinerInstance } from '@xyo-network/diviner-model'
import { PayloadDivinerQueryPayload, PayloadDivinerQuerySchema } from '@xyo-network/diviner-payload-model'
import { ImageThumbnail, ImageThumbnailSchema } from '@xyo-network/image-thumbnail-payload-plugin'
import { UrlPayload } from '@xyo-network/url-payload-plugin'
import compact from 'lodash/compact'

import { ImageThumbnailDivinerConfigSchema } from './Config'
import { ImageThumbnailDivinerParams } from './Params'

export class ImageThumbnailDiviner<TParams extends ImageThumbnailDivinerParams = ImageThumbnailDivinerParams> extends AbstractDiviner<TParams> {
  static override configSchemas = [ImageThumbnailDivinerConfigSchema, DivinerConfigSchema]

  private _archivistInstance: Promise<ArchivistInstance> | undefined
  private _initializeArchivistConnectionIfNeededPromise: Promise<void> | undefined
  private _map: Record<string, string> | undefined
  private _payloadDivinerInstance: Promise<DivinerInstance> | undefined
  private _pollId?: string | number | NodeJS.Timeout

  get archivist() {
    return this.config.archivist
  }

  get payloadDiviner() {
    return this.config.payloadDiviner
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
        const module = await this.resolve(this.archivist)
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

  protected override async divineHandler(payloads: UrlPayload[] = []): Promise<ImageThumbnail[]> {
    await this.initializeArchivistConnectionIfNeeded()
    const urls = payloads.map((urlPayload) => urlPayload.url)
    const map = await this.getSafeMap()
    const archivist = await this.getArchivistInstance()
    const hashes = compact(urls.map((url) => map?.[url]))
    return (await archivist.get(hashes)).filter((payload): payload is ImageThumbnail => payload.schema === ImageThumbnailSchema)
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
            limit: 100000,
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
