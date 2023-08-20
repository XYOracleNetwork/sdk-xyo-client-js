import { assertEx } from '@xylabs/assert'
import { delay } from '@xylabs/delay'
import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { asArchivistInstance } from '@xyo-network/archivist-model'
import { DivinerConfigSchema } from '@xyo-network/diviner-model'
import { ImageThumbnail, ImageThumbnailSchema } from '@xyo-network/image-thumbnail-payload-plugin'
import { UrlPayload } from '@xyo-network/url-payload-plugin'
import compact from 'lodash/compact'

import { ImageThumbnailDivinerConfigSchema } from './Config'
import { ImageThumbnailDivinerParams } from './Params'

export class ImageThumbnailDiviner<TParams extends ImageThumbnailDivinerParams = ImageThumbnailDivinerParams> extends AbstractDiviner<TParams> {
  static override configSchemas = [ImageThumbnailDivinerConfigSchema, DivinerConfigSchema]

  private _map?: Record<string, ImageThumbnail>
  private _pollId?: string | number | NodeJS.Timeout

  get archivist() {
    return this.config.archivist
  }

  get pollFrequency() {
    return this.config.pollFrequency
  }

  protected override async divineHandler(payloads: UrlPayload[] = []): Promise<ImageThumbnail[]> {
    const urls = payloads.map((urlPayload) => urlPayload.url)
    const map = await this.getSafeMap()
    return compact(urls.map((url) => map?.[url]))
  }

  protected async loadMap() {
    if (await this.started()) {
      const archivist = asArchivistInstance(await this.resolve(this.archivist), 'Provided archivist address did not resolve to an Archivist')
      const allPayloads = await assertEx(archivist.all, "Archivist does not support 'get'")()
      const imagePayloads = allPayloads.filter((payload): payload is ImageThumbnail => payload.schema === ImageThumbnailSchema)
      this._map = imagePayloads.reduce<Record<string, ImageThumbnail>>((prev, imagePayload) => {
        prev[imagePayload.sourceUrl] = imagePayload
        return prev
      }, {})
    }
  }

  protected override async startHandler(): Promise<boolean> {
    if (await super.startHandler()) {
      await this.poll()
      return true
    } else {
      return false
    }
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
