import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { PayloadHasher } from '@xyo-network/core'
import { DivinerConfigSchema } from '@xyo-network/diviner-model'
import { PayloadDivinerQuerySchema } from '@xyo-network/diviner-payload-model'
import { isImageThumbnailDivinerQuery } from '@xyo-network/image-thumbnail-payload-plugin'
import { Labels } from '@xyo-network/module-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'
import { UrlSchema } from '@xyo-network/url-payload-plugin'

import { ImageThumbnailResultQuery } from './ImageThumbnailResultQuery'

export interface ImageThumbnailDivinerLabels extends Labels {
  'network.xyo.storage.class': 'mongodb'
}

export const ImageThumbnailDivinerLabels: ImageThumbnailDivinerLabels = {
  'network.xyo.storage.class': 'mongodb',
}

export class ImageThumbnailQueryToImageThumbnailIndexQueryDiviner extends AbstractDiviner {
  static labels = ImageThumbnailDivinerLabels
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
