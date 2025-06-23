import type { Module } from '@xyo-network/module-model'

import type { BridgeModuleEventData } from './EventData.ts'
import type { BridgeParams } from './Params.ts'

export type BridgeModule<TParams extends BridgeParams = BridgeParams, TEventData extends BridgeModuleEventData = BridgeModuleEventData> =
  Module<TParams, TEventData>
