import { exists } from '@xylabs/exists'
import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { PayloadHasher } from '@xyo-network/core'
import { DivinerConfigSchema } from '@xyo-network/diviner-model'
import {
  ImageThumbnailResult,
  ImageThumbnailResultFields,
  ImageThumbnailResultSchema,
  isImageThumbnailDivinerQuery,
  isImageThumbnailResultIndex,
} from '@xyo-network/image-thumbnail-payload-plugin'
import { Labels } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'
import { UrlSchema } from '@xyo-network/url-payload-plugin'

/**
 * Transforms an ImageThumbnailIndex response into an ImageThumbnailResponse response
 */
export class ImageThumbnailIndexQueryResponseToImageThumbnailQueryResponseDiviner extends AbstractDiviner {
  static override configSchemas = [DivinerConfigSchema]
  static labels: Labels = {
    'network.xyo.diviner.stage': 'indexQueryResponseToDivinerQueryResponseDiviner',
  }

  protected override async divineHandler(payloads: Payload[] = []): Promise<ImageThumbnailResult[]> {
    // Filter out the two operands
    const imageThumbnailDivinerQueries = payloads.filter(isImageThumbnailDivinerQuery)
    const imageThumbnailResultIndexes = payloads.filter(isImageThumbnailResultIndex)

    // If we have operands
    if (imageThumbnailDivinerQueries.length && imageThumbnailResultIndexes.length) {
      // Create a dictionary to translate index keys to the urls that represent them
      const keyToUrlDictionary = Object.fromEntries(
        await Promise.all(
          imageThumbnailDivinerQueries.map(async (imageThumbnailDivinerQuery) => {
            const { url } = imageThumbnailDivinerQuery
            const urlPayload = new PayloadBuilder<ImageThumbnailResult>({ schema: UrlSchema }).fields({ url }).build()
            const key = await PayloadHasher.hashAsync(urlPayload)
            return [key, url] as const
          }),
        ),
      )
      // Map the indexes to responses using the dictionary
      return imageThumbnailResultIndexes
        .map((imageThumbnailResultIndex) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { key, schema, ...commonFields } = imageThumbnailResultIndex
          const url = keyToUrlDictionary?.[key]
          if (url) {
            const fields: ImageThumbnailResultFields = { ...commonFields, url }
            return new PayloadBuilder<ImageThumbnailResult>({ schema: ImageThumbnailResultSchema }).fields(fields).build()
          }
        })
        .filter(exists)
    }
    return []
  }
}
