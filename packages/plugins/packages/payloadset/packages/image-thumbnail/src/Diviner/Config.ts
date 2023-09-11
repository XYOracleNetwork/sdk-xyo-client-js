import { DivinerConfig } from '@xyo-network/diviner-model'
import { ImageThumbnailSchema } from '@xyo-network/image-thumbnail-payload-plugin'

export const ImageThumbnailDivinerConfigSchema = `${ImageThumbnailSchema}.diviner.config` as const
export type ImageThumbnailDivinerConfigSchema = typeof ImageThumbnailDivinerConfigSchema

export type ImageThumbnailDivinerConfig = DivinerConfig<{
  archivist?: string
  payloadDiviner?: string
  payloadDivinerLimit?: number
  pollFrequency?: number
  schema: ImageThumbnailDivinerConfigSchema
}>
