import type { SearchableStorage } from '@xyo-network/diviner-model'

export interface AsyncQueryBusIntersectConfig {
  /**
   * Configuration for intermediary query storage
   */
  queries?: SearchableStorage

  /**
   * Configuration for intermediary response storage
   */
  responses?: SearchableStorage
}
