import { BaseParams } from '@xylabs/object'
import { BridgeParams } from '@xyo-network/bridge-model'
import { AnyConfigSchema, ModuleResolver } from '@xyo-network/module-model'

import { AsyncQueryBusConfig, PubSubBridgeConfig } from './Config'

/**
 * The parameters for the PubSubBridge
 */
export type PubSubBridgeParams<TConfig extends AnyConfigSchema<PubSubBridgeConfig> = AnyConfigSchema<PubSubBridgeConfig>> = BridgeParams<TConfig>

export type AsyncQueryBusParams = BaseParams<{
  config: AsyncQueryBusConfig
  resolver: ModuleResolver
}>
