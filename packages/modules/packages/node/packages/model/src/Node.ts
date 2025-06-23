import type { Module, ModuleEventData } from '@xyo-network/module-model'

import type {
  ModuleAttachedEventData, ModuleDetachedEventData, ModuleRegisteredEventData, ModuleUnregisteredEventData,
} from './EventsModels/index.ts'
import type { NodeParams } from './Params.ts'

export interface NodeModuleEventData
  extends ModuleAttachedEventData,
  ModuleDetachedEventData,
  ModuleRegisteredEventData,
  ModuleUnregisteredEventData,
  ModuleEventData {}

export type NodeModule<TParams extends NodeParams = NodeParams, TEventData extends NodeModuleEventData = NodeModuleEventData> =
  Module<TParams, TEventData>
