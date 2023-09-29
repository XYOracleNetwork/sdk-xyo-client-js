import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'

import { ImageThumbnailSchema } from './Schema'

export type ImageThumbnail = Payload<
  {
    http?: {
      dnsError?: string
      ipAddress?: string
      status?: number
    }
    mime?: {
      detected?: {
        ext?: string
        mime?: string
      }
      invalid?: boolean
      returned?: string
      type?: string
    }
    sourceHash?: string
    sourceUrl: string
    url?: string
  },
  ImageThumbnailSchema
>

export const isImageThumbnail = isPayloadOfSchemaType<ImageThumbnail>(ImageThumbnailSchema)
