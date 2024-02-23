import { CacheConfig } from '@xyo-network/bridge-model'

import { AsyncQueryBusBaseConfig } from './BaseConfig'

export interface AsyncQueryBusClientConfig extends AsyncQueryBusBaseConfig {
  /**
   * Configuration for intermediary response storage
   */
  queryCache?: CacheConfig | true
}
