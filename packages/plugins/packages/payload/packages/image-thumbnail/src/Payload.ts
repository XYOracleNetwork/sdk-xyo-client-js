import { Payload } from '@xyo-network/payload-model'

import { ImageThumbnailSchema } from './Schema'

export type ImageThumbnail = Payload<
  {
    http?: {
      dnsError?: string
      ipAddress?: string
      status?: number
    }
    mime?: {
      invalid?: boolean
      type?: string
    }
    sourceHash?: string
    sourceUrl: string
    url?: string
  },
  ImageThumbnailSchema
>
