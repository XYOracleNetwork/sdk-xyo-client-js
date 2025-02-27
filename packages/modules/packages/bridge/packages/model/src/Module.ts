import { Module } from '@xyo-network/module-model'

import { BridgeModuleEventData } from './EventData.ts'
import { BridgeParams } from './Params.ts'

export interface BridgeModule<TParams extends BridgeParams = BridgeParams, TEventData extends BridgeModuleEventData = BridgeModuleEventData>
  extends Module<TParams, TEventData> {}
