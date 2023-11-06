import { ImageThumbnailSchema } from '@xyo-network/image-thumbnail-payload-plugin'
import { WitnessConfig } from '@xyo-network/witness-model'

export const ImageThumbnailWitnessConfigSchema = `${ImageThumbnailSchema}.witness.config` as const
export type ImageThumbnailWitnessConfigSchema = typeof ImageThumbnailWitnessConfigSchema

export type ImageThumbnailEncoding = 'PNG' | 'JPG' | 'GIF'

export type ImageThumbnailWitnessConfig = WitnessConfig<{
  dataUrlPassthrough?: boolean
  encoding?: ImageThumbnailEncoding
  height?: number
  ipfsGateway?: string
  maxAsyncProcesses?: number
  maxCacheBytes?: number
  maxCacheEntries?: number
  quality?: number
  runExclusive?: boolean
  schema: ImageThumbnailWitnessConfigSchema
  width?: number
}>
