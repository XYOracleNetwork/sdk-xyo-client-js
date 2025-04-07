import type { BaseParams } from '@xylabs/base'
import type { QueryFulfillFinishedEventArgs, QueryFulfillStartedEventArgs } from '@xyo-network/bridge-model'
import type { ModuleInstance } from '@xyo-network/module-model'

import type { AsyncQueryBusBaseConfig } from './BaseConfig.ts'
import type { AsyncQueryBusClientConfig } from './ClientConfig.ts'
import type { AsyncQueryBusHostConfig } from './HostConfig.ts'

export type AsyncQueryBusParams<TConfig extends AsyncQueryBusBaseConfig = AsyncQueryBusBaseConfig> = BaseParams<{
  config?: TConfig
  rootModule: ModuleInstance
}>

export type AsyncQueryBusClientParams = AsyncQueryBusParams<AsyncQueryBusClientConfig>
export type AsyncQueryBusHostParams = AsyncQueryBusParams<AsyncQueryBusHostConfig> & {
  onQueryFulfillFinished?: (args: Omit<QueryFulfillFinishedEventArgs, 'mod'>) => void
  onQueryFulfillStarted?: (args: Omit<QueryFulfillStartedEventArgs, 'mod'>) => void
}
