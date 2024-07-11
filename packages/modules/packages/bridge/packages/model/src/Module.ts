import { Module } from '@xyo-network/module-model'

import { BridgeModuleEventData } from './EventData.js'
import { BridgeParams } from './Params.js'

export interface BridgeModule<TParams extends BridgeParams = BridgeParams, TEventData extends BridgeModuleEventData = BridgeModuleEventData>
  extends Module<TParams, TEventData> {}
