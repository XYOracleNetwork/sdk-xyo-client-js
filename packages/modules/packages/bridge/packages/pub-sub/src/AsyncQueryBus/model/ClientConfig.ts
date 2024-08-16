import type { BridgeClientConfig } from '@xyo-network/bridge-model'
import type { CacheConfig } from '@xyo-network/module-model'

import type { AsyncQueryBusBaseConfig } from './BaseConfig.ts'

export interface AsyncQueryBusClientConfig extends AsyncQueryBusBaseConfig, BridgeClientConfig {
  /**
   * Configuration for intermediary response storage
   */
  queryCache?: CacheConfig | true
}
