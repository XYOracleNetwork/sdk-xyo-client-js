import { BridgeParams } from '@xyo-network/bridge-model'
import { AnyConfigSchema } from '@xyo-network/module-model'

import { PubSubBridgeConfig } from './Config'

/**
 * The parameters for the PubSubBridge
 */
export type PubSubBridgeParams<TConfig extends AnyConfigSchema<PubSubBridgeConfig> = AnyConfigSchema<PubSubBridgeConfig>> = BridgeParams<TConfig>
