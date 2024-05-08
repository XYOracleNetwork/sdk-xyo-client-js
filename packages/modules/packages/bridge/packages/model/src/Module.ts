import { Module } from '@xyo-network/module-model'

import { BridgeModuleEventData } from './EventData'
import { BridgeParams } from './Params'

export interface BridgeModule<TParams extends BridgeParams = BridgeParams, TEventData extends BridgeModuleEventData = BridgeModuleEventData>
  extends Module<TParams, TEventData> {}
