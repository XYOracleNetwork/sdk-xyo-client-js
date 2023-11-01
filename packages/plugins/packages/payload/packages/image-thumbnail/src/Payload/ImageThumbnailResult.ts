import { Hash } from '@xyo-network/hash'
import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'

import { ImageThumbnailSchema } from '../Schema'

export const ImageThumbnailResultIndexSchema = `${ImageThumbnailSchema}.index` as const
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
 * Data used for indexing ImageThumbnailResults
 */
export type ImageThumbnailResultIndex = HashKeyedIndex<{
  /**
   * The key for the index
   */
  key: string
  /**
   * The hashes of the timestamp & image thumbnail payloads used to create this result
   */
  sources: string[]
  /**
   * The HTTP status code of the thumbnail generation request
   */
  status?: number
  /**
   * True for successful thumbnail witnessing, false for failure
   */
  success: boolean
  /**
   * The timestamp of the thumbnail generation request
   */
  timestamp: number
  /**
   * @deprecated Use key instead
   */
  url: string
}>

// @deprecated: Use ImageThumbnailResultIndex instead
export type ImageThumbnailResultInfo = ImageThumbnailResultIndex

export type ImageThumbnailResult = Payload<ImageThumbnailResultIndex, ImageThumbnailResultIndexSchema>

export const isImageThumbnailResult = isPayloadOfSchemaType<ImageThumbnailResult>(ImageThumbnailResultIndexSchema)
