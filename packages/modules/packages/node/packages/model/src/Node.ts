import { Address } from '@xylabs/hex'
import { Promisable } from '@xylabs/promise'
import { Module, ModuleEventData, ModuleIdentifier, ModuleInstance } from '@xyo-network/module-model'

import { ModuleAttachedEventData, ModuleDetachedEventData, ModuleRegisteredEventData, ModuleUnregisteredEventData } from './EventsModels'
import { NodeParams } from './Params'

export interface NodeQueryFunctions {
  attach(nameOrAddress: ModuleIdentifier, external?: boolean): Promisable<Address | undefined>
  attached(): Promisable<Address[]>
  detach(nameOrAddress: ModuleIdentifier): Promisable<Address | undefined>
  registered(): Promisable<Address[]>
}

export interface NodeModuleEventData
  extends ModuleAttachedEventData,
    ModuleDetachedEventData,
    ModuleRegisteredEventData,
    ModuleUnregisteredEventData,
    ModuleEventData {}

export interface NodeModule<TParams extends NodeParams = NodeParams, TEventData extends NodeModuleEventData = NodeModuleEventData>
  extends Module<TParams, TEventData> {}

export interface NodeInstance<TParams extends NodeParams = NodeParams, TEventData extends NodeModuleEventData = NodeModuleEventData>
  extends NodeModule<TParams, TEventData>,
    NodeQueryFunctions,
    ModuleInstance<TParams, TEventData> {
  register: (mod: ModuleInstance) => Promisable<void>
  registeredModules(): Promisable<ModuleInstance[]>
}
