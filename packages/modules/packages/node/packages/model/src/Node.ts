import { NodeManifestPayload } from '@xyo-network/manifest-model'
import { Module, ModuleEventData, ModuleInstance, ModuleParams } from '@xyo-network/module-model'
import { Promisable } from '@xyo-network/promise'

import { NodeConfig } from './Config'
import { ModuleAttachedEventData, ModuleDetachedEventData, ModuleRegisteredEventData, ModuleUnregisteredEventData } from './EventsModels'
import { NodeParams } from './Params'

export interface NodeQueryFunctions {
  attach(nameOrAddress: string, external?: boolean): Promisable<string | undefined>
  attached(): Promisable<string[]>
  detach(nameOrAddress: string): Promisable<string | undefined>
  manifest(): Promise<NodeManifestPayload>
  registered(): Promisable<string[]>
}

export interface NodeModuleEventData
  extends ModuleAttachedEventData,
    ModuleDetachedEventData,
    ModuleRegisteredEventData,
    ModuleUnregisteredEventData,
    ModuleEventData {}

export type NodeModule<TParams extends NodeParams = NodeParams, TEventData extends NodeModuleEventData = NodeModuleEventData> = Module<
  TParams,
  TEventData
>

export type NodeInstance<TParams extends NodeParams = NodeParams, TEventData extends NodeModuleEventData = NodeModuleEventData> = NodeModule<
  TParams,
  TEventData
> &
  NodeQueryFunctions &
  ModuleInstance & {
    register: (module: ModuleInstance) => Promisable<void>
    registeredModules(): Promisable<ModuleInstance[]>
  }
