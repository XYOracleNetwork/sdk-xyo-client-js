/**
 * The index direction (1 for ascending, -1 for descending)
 */
export type IndexDirection = -1 | 1

/**
 * Description of index(es) to be created on a store
 */
export type IndexDescription = {
  /**
   * The key(s) to index
   */
  key: Record<string, IndexDirection>
  /**
   * Is the indexed value an array
   */
  multiEntry?: boolean
  /**
   * The name of the index
   */
  name?: string
  /**
   * If true, the index must enforce uniqueness on the key
   */
  unique?: boolean
}

export const IndexSeparator = '-'

/**
 * Given an index description, this will build the index
 * name in standard form
 * @param index The index description
 * @returns The index name in standard form
 */
export const buildStandardIndexName = (index: IndexDescription) => {
  const { key, unique } = index
  const prefix = unique ? 'UX' : 'IX'
  const indexKeys = Object.keys(key)
  return `${prefix}_${indexKeys.join(IndexSeparator)}`
}
