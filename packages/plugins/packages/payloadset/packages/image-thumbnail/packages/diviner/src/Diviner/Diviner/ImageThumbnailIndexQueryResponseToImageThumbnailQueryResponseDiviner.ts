import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { DivinerConfigSchema } from '@xyo-network/diviner-model'
import {
  ImageThumbnailResult,
  ImageThumbnailResultFields,
  ImageThumbnailResultSchema,
  isImageThumbnailDivinerQuery,
  isImageThumbnailResultIndex,
} from '@xyo-network/image-thumbnail-payload-plugin'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'

export class ImageThumbnailIndexQueryResponseToImageThumbnailQueryResponseDiviner extends AbstractDiviner {
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
