import { BridgeParams } from '@xyo-network/bridge-model'
import { AnyConfigSchema } from '@xyo-network/module-model'

import { WebsocketBridgeConfig } from './Config.js'

export type WebsocketBridgeParams<TConfig extends AnyConfigSchema<WebsocketBridgeConfig> = AnyConfigSchema<WebsocketBridgeConfig>> =
  BridgeParams<TConfig>
