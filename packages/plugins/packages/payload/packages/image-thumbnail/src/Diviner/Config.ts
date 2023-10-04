import { DivinerConfig } from '@xyo-network/diviner-model'
import { ImageThumbnailSchema } from '@xyo-network/image-thumbnail-payload-plugin'

export const ImageThumbnailDivinerConfigSchema = `${ImageThumbnailSchema}.diviner.config` as const
export type ImageThumbnailDivinerConfigSchema = typeof ImageThumbnailDivinerConfigSchema

/**
 * Describes an Archivist/Diviner combination
 * that enables searching signed payloads
 */
export interface SearchableStorage {
  archivist: string
  boundWitnessDiviner: string
  payloadDiviner: string
}

export type ImageThumbnailDivinerConfig = DivinerConfig<{
  /** @deprecated Use appropriate Storage */
  archivist?: string
  /**
   * Where the diviner should store it's index
   */
  indexStore?: SearchableStorage
  /** @deprecated Use appropriate Storage */
  payloadDiviner?: string
  payloadDivinerLimit?: number
  pollFrequency?: number
  schema: ImageThumbnailDivinerConfigSchema
  /**
   * Where the diviner should persist its internal state
   */
  stateStore?: SearchableStorage
  /**
   * Where the diviner should look for stored thumbnails
   */
  thumbnailStore?: SearchableStorage
}>
