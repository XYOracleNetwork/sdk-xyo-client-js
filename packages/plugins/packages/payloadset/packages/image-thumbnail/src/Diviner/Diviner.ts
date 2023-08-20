import { assertEx } from '@xylabs/assert'
import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { asArchivistInstance } from '@xyo-network/archivist-model'
import { DivinerConfigSchema } from '@xyo-network/diviner-model'
import { ImageThumbnail, ImageThumbnailSchema } from '@xyo-network/image-thumbnail-payload-plugin'
import { UrlPayload } from '@xyo-network/url-payload-plugin'

import { ImageThumbnailDivinerConfigSchema } from './Config'
import { ImageThumbnailDivinerParams } from './Params'

export class ImageThumbnailDiviner<TParams extends ImageThumbnailDivinerParams = ImageThumbnailDivinerParams> extends AbstractDiviner<TParams> {
  static override configSchemas = [ImageThumbnailDivinerConfigSchema, DivinerConfigSchema]

  get archivist() {
    return this.config.archivist
  }

  protected override async divineHandler(payloads: UrlPayload[] = []): Promise<ImageThumbnail[]> {
    const urls = payloads.map((urlPayload) => urlPayload.url)
    const archivist = asArchivistInstance(await this.resolve(this.archivist), 'Provided archivist address did not resolve to an Archivist')
    const allPayloads = await assertEx(archivist.all, "Archivist does not support 'get'")()
    const imagePayloads = allPayloads.filter((payload): payload is ImageThumbnail => payload.schema === ImageThumbnailSchema)
    return imagePayloads.filter((image) => image.url && urls.includes(image.url))
  }
}
