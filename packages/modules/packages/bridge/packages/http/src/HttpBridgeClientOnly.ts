import { BridgeParams } from '@xyo-network/bridge-model'
import { AnyConfigSchema, creatableModule } from '@xyo-network/module-model'

import { HttpBridgeBase } from './HttpBridgeBase.ts'
import { HttpBridgeConfig } from './HttpBridgeConfig.ts'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface HttpBridgeParams extends BridgeParams<AnyConfigSchema<HttpBridgeConfig>> {}

@creatableModule()
export class HttpBridge<TParams extends HttpBridgeParams> extends HttpBridgeBase<TParams> {}
