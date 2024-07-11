import { BridgeParams } from '@xyo-network/bridge-model'
import { AnyConfigSchema, creatableModule } from '@xyo-network/module-model'

import { HttpBridgeBase } from './HttpBridgeBase.js'
import { HttpBridgeConfig } from './HttpBridgeConfig.js'

export interface HttpBridgeParams extends BridgeParams<AnyConfigSchema<HttpBridgeConfig>> {}

@creatableModule()
export class HttpBridge<TParams extends HttpBridgeParams> extends HttpBridgeBase<TParams> {}
