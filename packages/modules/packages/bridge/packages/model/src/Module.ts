import { Module } from '@xyo-network/module-model'

import { BridgeModuleEventData } from './EventData.ts'
import { BridgeParams } from './Params.ts'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface BridgeModule<TParams extends BridgeParams = BridgeParams, TEventData extends BridgeModuleEventData = BridgeModuleEventData>
  extends Module<TParams, TEventData> {}
