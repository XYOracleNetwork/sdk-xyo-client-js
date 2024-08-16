import type { BridgeParams } from '@xyo-network/bridge-model'
import type { AnyConfigSchema } from '@xyo-network/module-model'

import type { PubSubBridgeConfig } from './Config.ts'

/**
 * The parameters for the PubSubBridge
 */
export type PubSubBridgeParams<TConfig extends AnyConfigSchema<PubSubBridgeConfig> = AnyConfigSchema<PubSubBridgeConfig>> = BridgeParams<TConfig>
