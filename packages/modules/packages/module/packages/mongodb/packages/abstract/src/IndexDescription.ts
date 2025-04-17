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
  key:
    | {
      [key: string]: IndexDirection
    }
    | Map<string, IndexDirection>
  /**
   * The name of the index
   */
  name?: string
  /**
   * If true, the index must enforce uniqueness on the key
   */
  unique?: boolean
}
