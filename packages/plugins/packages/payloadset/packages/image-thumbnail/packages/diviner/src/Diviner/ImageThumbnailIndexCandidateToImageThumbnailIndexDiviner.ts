import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { BoundWitness, isBoundWitness } from '@xyo-network/boundwitness-model'
import { PayloadHasher } from '@xyo-network/core'
import { DivinerConfigSchema } from '@xyo-network/diviner-model'
import {
  ImageThumbnail,
  ImageThumbnailResultIndex,
  ImageThumbnailResultIndexFields,
  ImageThumbnailResultIndexSchema,
  ImageThumbnailSchema,
  isImageThumbnail,
} from '@xyo-network/image-thumbnail-payload-plugin'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'
import { UrlSchema } from '@xyo-network/url-payload-plugin'
import { isTimestamp, TimeStamp, TimestampSchema } from '@xyo-network/witness-timestamp'

import { ImageThumbnailDivinerLabels, ImageThumbnailDivinerStageLabels } from './ImageThumbnailDivinerLabels'

/**
 * Transforms candidates for image thumbnail indexing into their indexed representation
 */
export class ImageThumbnailIndexCandidateToImageThumbnailIndexDiviner extends AbstractDiviner {
  static override configSchemas = [DivinerConfigSchema]
  static labels: ImageThumbnailDivinerStageLabels = {
    ...ImageThumbnailDivinerLabels,
    'network.xyo.diviner.stage': 'indexCandidateToIndexDiviner',
  }

  protected override async divineHandler(payloads: Payload[] = []): Promise<ImageThumbnailResultIndex[]> {
    const bws: BoundWitness[] = payloads.filter(isBoundWitness)
    const imageThumbnailPayloads: ImageThumbnail[] = payloads.filter(isImageThumbnail)
    const timestampPayloads: TimeStamp[] = payloads.filter(isTimestamp)
    if (bws.length && imageThumbnailPayloads.length && timestampPayloads.length) {
      const payloadDictionary = await PayloadHasher.toMap(payloads)
      const tuples: [BoundWitness, ImageThumbnail, TimeStamp][] = bws.reduce<[BoundWitness, ImageThumbnail, TimeStamp][]>(
        (acc, curr) => {
          const imageThumbnailIndex = curr.payload_schemas?.findIndex((schema) => schema === ImageThumbnailSchema)
          const timestampIndex = curr.payload_schemas?.findIndex((schema) => schema === TimestampSchema)
          const imageThumbnailHash = curr.payload_hashes?.[imageThumbnailIndex]
          const timestampHash = curr.payload_hashes?.[timestampIndex]
          const imageThumbnailPayload = [payloadDictionary[imageThumbnailHash]].find(isImageThumbnail)
          const timestampPayload = [payloadDictionary[timestampHash]].find(isTimestamp)
          if (imageThumbnailPayload && timestampPayload) acc.push([curr, imageThumbnailPayload, timestampPayload])
          return acc
        },
        [] as [BoundWitness, ImageThumbnail, TimeStamp][],
      )
      const indexes = await Promise.all(
        tuples.map(async ([bw, imageThumbnailPayload, timestampPayload]) => {
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
        }),
      )
      return indexes.flat()
    }
    return Promise.resolve([])
  }
}
