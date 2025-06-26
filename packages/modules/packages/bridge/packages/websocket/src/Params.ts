import type { BridgeParams } from '@xyo-network/bridge-model'
import type { AnyConfigSchema } from '@xyo-network/module-model'

import type { WebsocketBridgeConfig } from './Config.ts'

export type WebsocketBridgeParams<TConfig extends AnyConfigSchema<WebsocketBridgeConfig> = AnyConfigSchema<WebsocketBridgeConfig>>
  = BridgeParams<TConfig>
