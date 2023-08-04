import { Payload } from '@xyo-network/payload-model'

import { ImageThumbnailSchema } from './Schema'

export type ImageThumbnailPayload = Payload<{
  schema: ImageThumbnailSchema
  sourceHash: string
  sourceUrl: string
  url: string
}>
