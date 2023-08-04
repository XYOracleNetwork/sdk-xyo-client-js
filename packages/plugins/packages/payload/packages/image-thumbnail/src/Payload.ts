import { ModuleError, Payload } from '@xyo-network/payload-model'

import { ImageThumbnailSchema } from './Schema'

export type ImageThumbnailErrorPayload = ModuleError & {
  code?: string
  status?: number
  url: string
}

export type ImageThumbnailPayload = Payload<{
  schema: ImageThumbnailSchema
  sourceHash: string
  sourceUrl: string
  url: string
}>
