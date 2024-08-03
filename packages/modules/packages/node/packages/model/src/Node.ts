import { Module, ModuleEventData } from '@xyo-network/module-model'

import { ModuleAttachedEventData, ModuleDetachedEventData, ModuleRegisteredEventData, ModuleUnregisteredEventData } from './EventsModels/index.ts'
import { NodeParams } from './Params.ts'

export interface NodeModuleEventData
  extends ModuleAttachedEventData,
  ModuleDetachedEventData,
  ModuleRegisteredEventData,
  ModuleUnregisteredEventData,
  ModuleEventData {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NodeModule<TParams extends NodeParams = NodeParams, TEventData extends NodeModuleEventData = NodeModuleEventData>
  extends Module<TParams, TEventData> {}
