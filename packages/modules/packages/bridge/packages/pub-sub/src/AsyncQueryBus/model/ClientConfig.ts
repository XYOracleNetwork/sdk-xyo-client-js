import { BridgeClientConfig } from '@xyo-network/bridge-model'
import { CacheConfig } from '@xyo-network/module-model'

import { AsyncQueryBusBaseConfig } from './BaseConfig.js'

export interface AsyncQueryBusClientConfig extends AsyncQueryBusBaseConfig, BridgeClientConfig {
  /**
   * Configuration for intermediary response storage
   */
  queryCache?: CacheConfig | true
}
