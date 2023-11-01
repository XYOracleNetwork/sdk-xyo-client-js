import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'

import { ImageThumbnailSchema } from '../Schema'

export const ImageThumbnailResultSchema = `${ImageThumbnailSchema}.result` as const
export type ImageThumbnailResultSchema = typeof ImageThumbnailResultSchema

/**
 * Data associated with an image thumbnail witness result
 */
export interface ImageThumbnailResultFields {
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
   * The url of the thumbnail
   */
  url: string
}

export type ImageThumbnailResult = Payload<ImageThumbnailResultFields, ImageThumbnailResultSchema>

export const isImageThumbnailResult = isPayloadOfSchemaType<ImageThumbnailResult>(ImageThumbnailResultSchema)
