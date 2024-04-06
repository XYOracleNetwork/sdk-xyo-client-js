import { Address } from '@xylabs/hex'
import { Promisable } from '@xylabs/promise'
import { AttachableModuleInstance, Module, ModuleEventData, ModuleIdentifier, ModuleInstance } from '@xyo-network/module-model'

import { NodeConfig } from './Config'
import { ModuleAttachedEventData, ModuleDetachedEventData, ModuleRegisteredEventData, ModuleUnregisteredEventData } from './EventsModels'

export interface NodeQueryFunctions {
  attach: (nameOrAddress: ModuleIdentifier, external?: boolean) => Promisable<Address | undefined>
  attached: () => Promisable<Address[]>
  detach: (nameOrAddress: ModuleIdentifier) => Promisable<Address | undefined>
  registered: () => Promisable<Address[]>
}

export interface NodeModuleEventData
  extends ModuleAttachedEventData,
    ModuleDetachedEventData,
    ModuleRegisteredEventData,
    ModuleUnregisteredEventData,
    ModuleEventData {}

export interface NodeModule<TConfig extends NodeConfig = NodeConfig, TEventData extends NodeModuleEventData = NodeModuleEventData>
  extends Module<TConfig, TEventData> {}

export interface NodeInstance<TConfig extends NodeConfig = NodeConfig, TEventData extends NodeModuleEventData = NodeModuleEventData>
  extends NodeModule<TConfig, TEventData>,
    NodeQueryFunctions,
    ModuleInstance<TConfig, TEventData> {
  register?: (mod: AttachableModuleInstance) => Promisable<void>
  registeredModules?: () => Promisable<ModuleInstance[]>
  unregister?: (mod: ModuleInstance) => Promisable<ModuleInstance>
}
