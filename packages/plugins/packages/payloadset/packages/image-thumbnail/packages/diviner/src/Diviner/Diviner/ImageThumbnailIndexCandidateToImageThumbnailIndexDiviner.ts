import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { BoundWitness, isBoundWitness } from '@xyo-network/boundwitness-model'
import { PayloadHasher } from '@xyo-network/core'
import { DivinerConfigSchema } from '@xyo-network/diviner-model'
import {
  ImageThumbnail,
  ImageThumbnailResultIndex,
  ImageThumbnailResultIndexFields,
  ImageThumbnailResultIndexSchema,
  isImageThumbnail,
} from '@xyo-network/image-thumbnail-payload-plugin'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'
import { UrlSchema } from '@xyo-network/url-payload-plugin'
import { isTimestamp, TimeStamp } from '@xyo-network/witness-timestamp'

export class ImageThumbnailIndexCandidateToImageThumbnailIndexDiviner extends AbstractDiviner {
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
