import { SearchableStorage } from '@xyo-network/diviner-model'

import { AsyncQueryBusIntersectConfig } from './IntersectConfig.ts'

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
