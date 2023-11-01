import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'

import { ImageThumbnailSchema } from '../Schema'

export const ImageThumbnailResultIndexSchema = `${ImageThumbnailSchema}.index` as const
export type ImageThumbnailResultIndexSchema = typeof ImageThumbnailResultIndexSchema

/**
 * Data used for indexing ImageThumbnailResults
 */
export interface ImageThumbnailResultIndex {
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
   * The URL of the thumbnail
   */
  url: string
}

// @deprecated: Use ImageThumbnailResultIndex instead
export type ImageThumbnailResultInfo = ImageThumbnailResultIndex

export type ImageThumbnailResult = Payload<ImageThumbnailResultIndex, ImageThumbnailResultIndexSchema>

export const isImageThumbnailResult = isPayloadOfSchemaType<ImageThumbnailResult>(ImageThumbnailResultIndexSchema)
