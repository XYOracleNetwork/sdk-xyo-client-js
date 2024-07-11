import { Address } from '@xylabs/hex'
import { Promisable } from '@xylabs/promise'
import { ModuleInstance } from '@xyo-network/module-model'

import { BridgeModuleEventData } from './EventData.js'
import { BridgeModule } from './Module.js'
import { BridgeParams } from './Params.js'
import { BridgeQueryFunctions } from './QueryFunctions.js'

export interface BridgeInstance<TParams extends BridgeParams = BridgeParams, TEventData extends BridgeModuleEventData = BridgeModuleEventData>
  extends BridgeModule<TParams, TEventData>,
    BridgeQueryFunctions,
    ModuleInstance<TParams, TEventData> {
  exposed?: () => Promisable<Address[]>
}
