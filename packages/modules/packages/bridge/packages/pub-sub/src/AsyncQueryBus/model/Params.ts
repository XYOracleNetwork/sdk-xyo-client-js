import { BaseParams } from '@xylabs/object'
import { ModuleResolver } from '@xyo-network/module-model'

import { AsyncQueryBusBaseConfig } from './BaseConfig'
import { AsyncQueryBusClientConfig } from './ClientConfig'
import { AsyncQueryBusHostConfig } from './HostConfig'

export type AsyncQueryBusParams<TConfig extends AsyncQueryBusBaseConfig = AsyncQueryBusBaseConfig> = BaseParams<{
  config?: TConfig
  resolver: ModuleResolver
}>

export type AsyncQueryBusClientParams = AsyncQueryBusParams<AsyncQueryBusClientConfig>
export type AsyncQueryBusHostParams = AsyncQueryBusParams<AsyncQueryBusHostConfig>
