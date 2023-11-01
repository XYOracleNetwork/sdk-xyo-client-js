import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'

import { ImageThumbnailSchema } from '../Schema'

export interface ImageThumbnailMime {
  detected?: {
    ext?: string
    mime?: string
  }
  invalid?: boolean
  returned?: string
  type?: string
}

export type ImageThumbnail = Payload<
  {
    http?: {
      code?: string
      ipAddress?: string
      status?: number
    }
    mime?: ImageThumbnailMime
    sourceHash?: string
    sourceUrl: string
    url?: string
  },
  ImageThumbnailSchema
>

export const isImageThumbnail = isPayloadOfSchemaType<ImageThumbnail>(ImageThumbnailSchema)
