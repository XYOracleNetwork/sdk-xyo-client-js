import { BaseParams } from '@xylabs/object'
import { QueryFulfillFinishedEventArgs, QueryFulfillStartedEventArgs } from '@xyo-network/bridge-model'
import { ModuleInstance } from '@xyo-network/module-model'

import { AsyncQueryBusBaseConfig } from './BaseConfig.ts'
import { AsyncQueryBusClientConfig } from './ClientConfig.ts'
import { AsyncQueryBusHostConfig } from './HostConfig.ts'

export type AsyncQueryBusParams<TConfig extends AsyncQueryBusBaseConfig = AsyncQueryBusBaseConfig> = BaseParams<{
  config?: TConfig
  rootModule: ModuleInstance
}>

export type AsyncQueryBusClientParams = AsyncQueryBusParams<AsyncQueryBusClientConfig>
export type AsyncQueryBusHostParams = AsyncQueryBusParams<AsyncQueryBusHostConfig> & {
  onQueryFulfillFinished?: (args: Omit<QueryFulfillFinishedEventArgs, 'mod'>) => void
  onQueryFulfillStarted?: (args: Omit<QueryFulfillStartedEventArgs, 'mod'>) => void
}
