import type { Address, Promisable } from '@xylabs/sdk-js'
import type { ModuleInstance } from '@xyo-network/module-model'

import type { BridgeModuleEventData } from './EventData.ts'
import type { BridgeModule } from './Module.ts'
import type { BridgeParams } from './Params.ts'
import type { BridgeQueryFunctions } from './QueryFunctions.ts'

export interface BridgeInstance<TParams extends BridgeParams = BridgeParams, TEventData extends BridgeModuleEventData = BridgeModuleEventData>
  extends BridgeModule<TParams, TEventData>,
  BridgeQueryFunctions,
  ModuleInstance<TParams, TEventData> {
  exposed?: () => Promisable<Address[]>
}
