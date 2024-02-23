import { SearchableStorage } from './SearchableStorage'

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
