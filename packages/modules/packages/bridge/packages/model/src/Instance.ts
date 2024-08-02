import { Address } from '@xylabs/hex'
import { Promisable } from '@xylabs/promise'
import { ModuleInstance } from '@xyo-network/module-model'

import { BridgeModuleEventData } from './EventData.ts'
import { BridgeModule } from './Module.ts'
import { BridgeParams } from './Params.ts'
import { BridgeQueryFunctions } from './QueryFunctions.ts'

export interface BridgeInstance<TParams extends BridgeParams = BridgeParams, TEventData extends BridgeModuleEventData = BridgeModuleEventData>
  extends BridgeModule<TParams, TEventData>,
    BridgeQueryFunctions,
    ModuleInstance<TParams, TEventData> {
  exposed?: () => Promisable<Address[]>
}
