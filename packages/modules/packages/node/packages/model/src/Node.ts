import { Module, ModuleEventData } from '@xyo-network/module-model'

import { ModuleAttachedEventData, ModuleDetachedEventData, ModuleRegisteredEventData, ModuleUnregisteredEventData } from './EventsModels'
import { NodeParams } from './Params'

export interface NodeModuleEventData
  extends ModuleAttachedEventData,
    ModuleDetachedEventData,
    ModuleRegisteredEventData,
    ModuleUnregisteredEventData,
    ModuleEventData {}

export interface NodeModule<TParams extends NodeParams = NodeParams, TEventData extends NodeModuleEventData = NodeModuleEventData>
  extends Module<TParams, TEventData> {}
