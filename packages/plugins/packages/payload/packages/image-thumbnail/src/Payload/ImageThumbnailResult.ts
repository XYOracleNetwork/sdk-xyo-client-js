import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'

import { ImageThumbnailSchema } from '../Schema'

const ImageThumbnailResultIndexSchema = `${ImageThumbnailSchema}.index` as const
type ImageThumbnailResultIndexSchema = typeof ImageThumbnailResultIndexSchema

export interface ImageThumbnailResultInfo {
  sources: string[]
  // TODO: Something richer than HTTP status code that allows for info about failure modes
  status: number
  timestamp: number
  url: string
}

export type ImageThumbnailResult = Payload<ImageThumbnailResultInfo, ImageThumbnailResultIndexSchema>

export const isImageThumbnailResult = isPayloadOfSchemaType<ImageThumbnailResult>(ImageThumbnailResultIndexSchema)
