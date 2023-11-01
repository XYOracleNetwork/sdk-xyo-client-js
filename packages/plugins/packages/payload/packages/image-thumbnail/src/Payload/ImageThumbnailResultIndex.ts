import { Hash } from '@xyo-network/hash'
import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'

import { ImageThumbnailResultFields, ImageThumbnailResultSchema } from './ImageThumbnailResult'

export const ImageThumbnailResultIndexSchema = `${ImageThumbnailResultSchema}.index` as const
export type ImageThumbnailResultIndexSchema = typeof ImageThumbnailResultIndexSchema

/**
 * An index which is keyed by a hash. Used to create uniformity in the way
 * we index data (key length, character set, etc).
 */
export type HashKeyedIndex<T> = T & {
  /**
   * The key for the index. Should be a hash of the relevant identifying data.
   */
  key: Hash
}

/**
 * The indexed fields of an ImageThumbnailResult
 */
export type ImageThumbnailResultIndexFields = HashKeyedIndex<Omit<ImageThumbnailResultFields, 'url'>>

/**
 * Data used for indexing ImageThumbnailResults
 */
export type ImageThumbnailResultIndex = Payload<ImageThumbnailResultIndexFields, ImageThumbnailResultIndexSchema>

export const isImageThumbnailResultIndex = isPayloadOfSchemaType<ImageThumbnailResultIndex>(ImageThumbnailResultIndexSchema)
