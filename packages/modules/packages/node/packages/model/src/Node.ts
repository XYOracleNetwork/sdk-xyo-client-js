import { Promisable } from '@xylabs/promise'
import { ModuleManifestPayload } from '@xyo-network/manifest-model'
import { Module, ModuleEventData, ModuleInstance } from '@xyo-network/module-model'

import { ModuleAttachedEventData, ModuleDetachedEventData, ModuleRegisteredEventData, ModuleUnregisteredEventData } from './EventsModels'
import { NodeParams } from './Params'

export interface NodeQueryFunctions {
  attach(nameOrAddress: string, external?: boolean): Promisable<string | undefined>
  attached(): Promisable<string[]>
  detach(nameOrAddress: string): Promisable<string | undefined>
  manifest(maxDepth?: number): Promise<ModuleManifestPayload>
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
    register: (mod: ModuleInstance) => Promisable<void>
    registeredModules(): Promisable<ModuleInstance[]>
  }
