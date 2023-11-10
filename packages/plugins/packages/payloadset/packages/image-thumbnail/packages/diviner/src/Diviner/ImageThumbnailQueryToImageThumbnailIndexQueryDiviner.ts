import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { PayloadHasher } from '@xyo-network/core'
import { DivinerConfigSchema } from '@xyo-network/diviner-model'
import { PayloadDivinerQuerySchema } from '@xyo-network/diviner-payload-model'
import { isImageThumbnailDivinerQuery } from '@xyo-network/image-thumbnail-payload-plugin'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'
import { UrlSchema } from '@xyo-network/url-payload-plugin'

import { ImageThumbnailDivinerLabels, ImageThumbnailDivinerStageLabels } from './ImageThumbnailDivinerLabels'
import { ImageThumbnailResultQuery } from './ImageThumbnailResultQuery'

/**
 * A diviner that converts ImageThumbnailDivinerQuery to ImageThumbnailResultQuery
 */
export class ImageThumbnailQueryToImageThumbnailIndexQueryDiviner extends AbstractDiviner {
  static override configSchemas = [DivinerConfigSchema]
  static labels: ImageThumbnailDivinerStageLabels = {
    ...ImageThumbnailDivinerLabels,
    'network.xyo.diviner.stage': 'divinerQueryToIndexQueryDiviner',
  }
  protected override async divineHandler(payloads: Payload[] = []): Promise<ImageThumbnailResultQuery[]> {
    const queries = payloads.filter(isImageThumbnailDivinerQuery)
    if (queries.length) {
      const results = await Promise.all(
        queries.map(async (query) => {
          const { limit: payloadLimit, offset: payloadOffset, order: payloadOrder, status: payloadStatus, success: payloadSuccess, url } = query
          const limit = payloadLimit ?? 1
          const order = payloadOrder ?? 'desc'
          const offset = payloadOffset ?? 0
          const urlPayload = { schema: UrlSchema, url }
          const key = await PayloadHasher.hashAsync(urlPayload)
          const fields: Partial<ImageThumbnailResultQuery> = { key, limit, offset, order }
          if (payloadSuccess !== undefined) fields.success = payloadSuccess
          if (payloadStatus !== undefined) fields.status = payloadStatus
          return new PayloadBuilder<ImageThumbnailResultQuery>({ schema: PayloadDivinerQuerySchema }).fields(fields).build()
        }),
      )
      return results
    }
    return Promise.resolve([])
  }
}
