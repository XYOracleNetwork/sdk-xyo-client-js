import { Hash } from '@xyo-network/hash'

import { ImageThumbnailResult, ImageThumbnailResultSchema } from './ImageThumbnailResult'

export const ImageThumbnailResultIndexSchema = `${ImageThumbnailResultSchema}.index` as const
export type ImageThumbnailResultIndexSchema = typeof ImageThumbnailResultIndexSchema

/**
 * An index which is keyed by a hash. Used to create uniformity in the way
 * we index data (key length, character set, etc).
 */
export type HashKeyedIndex<T> = T & {
  /**
   * The key for the index. Should be a hash of the relevant identifying data.
   */
  key: Hash
}

/**
 * Data used for indexing ImageThumbnailResults
 */
export type ImageThumbnailResultIndex = HashKeyedIndex<Omit<ImageThumbnailResult, 'url'>>
