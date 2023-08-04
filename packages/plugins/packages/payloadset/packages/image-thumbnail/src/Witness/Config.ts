import { ImageThumbnailSchema } from '@xyo-network/image-thumbnail-payload-plugin'
import { WitnessConfig } from '@xyo-network/witness'

export const ImageThumbnailWitnessConfigSchema = `${ImageThumbnailSchema}.witness.config` as const
export type ImageThumbnailWitnessConfigSchema = typeof ImageThumbnailWitnessConfigSchema

export type ImageThumbnailWitnessConfig = WitnessConfig<{
  schema: ImageThumbnailWitnessConfigSchema
}>
