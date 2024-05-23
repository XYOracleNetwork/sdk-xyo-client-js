import { Address } from '@xylabs/hex'
import { Promisable } from '@xylabs/promise'
import { ModuleInstance } from '@xyo-network/module-model'

import { BridgeModuleEventData } from './EventData'
import { BridgeModule } from './Module'
import { BridgeParams } from './Params'
import { BridgeQueryFunctions } from './QueryFunctions'

export interface BridgeInstance<TParams extends BridgeParams = BridgeParams, TEventData extends BridgeModuleEventData = BridgeModuleEventData>
  extends BridgeModule<TParams, TEventData>,
    BridgeQueryFunctions,
    ModuleInstance<TParams, TEventData> {
  exposed?: () => Promisable<Address[]>
}
