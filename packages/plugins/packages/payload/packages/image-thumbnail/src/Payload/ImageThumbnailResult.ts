import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'

import { ImageThumbnailSchema } from '../Schema'

export const ImageThumbnailResultIndexSchema = `${ImageThumbnailSchema}.index` as const
export type ImageThumbnailResultIndexSchema = typeof ImageThumbnailResultIndexSchema

export interface ImageThumbnailResultInfo {
  sources: string[]
  status?: number
  success: boolean
  timestamp: number
  url: string
}

export type ImageThumbnailResult = Payload<ImageThumbnailResultInfo, ImageThumbnailResultIndexSchema>

export const isImageThumbnailResult = isPayloadOfSchemaType<ImageThumbnailResult>(ImageThumbnailResultIndexSchema)
