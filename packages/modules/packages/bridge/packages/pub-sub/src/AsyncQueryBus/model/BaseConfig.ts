import { AsyncQueryBusIntersectConfig } from './IntersectConfig'
import { SearchableStorage } from './SearchableStorage'

export interface AsyncQueryBusBaseConfig {
  intersect?: AsyncQueryBusIntersectConfig

  /**
   * How often to poll for new queries/responses
   */
  pollFrequency?: number

  /**
   * Where the archivist should persist its internal state
   */
  stateStore?: SearchableStorage
}
