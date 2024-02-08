import { BaseParams } from '@xylabs/object'
import { ModuleResolver } from '@xyo-network/module-model'

import { AsyncQueryBusConfig } from './Config'

export type AsyncQueryBusParams = BaseParams<{
  config: AsyncQueryBusConfig
  resolver: ModuleResolver
}>
