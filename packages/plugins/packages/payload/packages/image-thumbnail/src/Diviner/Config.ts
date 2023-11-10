import { DivinerConfig } from '@xyo-network/diviner-model'

import { ImageThumbnailDivinerSchema } from './Schema'

export const ImageThumbnailDivinerConfigSchema = `${ImageThumbnailDivinerSchema}.config` as const
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
  /**
   * Where the diviner should store it's index
   */
  indexStore?: SearchableStorage
  payloadDivinerLimit?: number
  pollFrequency?: number
  schema: ImageThumbnailDivinerConfigSchema
  /**
   * Where the diviner should persist its internal state
   */
  stateStore?: SearchableStorage
}>
