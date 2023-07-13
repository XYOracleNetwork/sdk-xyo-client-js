import { AnyObject } from '@xyo-network/core'
import { AnyConfigSchema, DirectModule, IndirectModule, Module, ModuleEventData, ModuleParams } from '@xyo-network/module-model'
import { Promisable } from '@xyo-network/promise'

import { NodeConfig } from './Config'
import { ModuleAttachedEventData, ModuleDetachedEventData, ModuleRegisteredEventData, ModuleUnregisteredEventData } from './Events'

export interface NodeQueryFunctions {
  attach(nameOrAddress: string, external?: boolean): Promisable<string | undefined>
  attached(): Promisable<string[]>
  detach(nameOrAddress: string): Promisable<string | undefined>
  registered(): Promisable<string[]>
}

export interface NodeModuleEventData
  extends ModuleAttachedEventData,
    ModuleDetachedEventData,
    ModuleRegisteredEventData,
    ModuleUnregisteredEventData,
    ModuleEventData {}

export type NodeModuleParams<
  TConfig extends AnyConfigSchema<NodeConfig> = AnyConfigSchema<NodeConfig>,
  TAdditionalParams extends AnyObject | undefined = undefined,
> = ModuleParams<TConfig, TAdditionalParams>

export type IndirectNodeModule<
  TParams extends ModuleParams<AnyConfigSchema<NodeConfig>> = ModuleParams<AnyConfigSchema<NodeConfig>>,
  TEventData extends ModuleEventData = ModuleEventData,
> = IndirectModule<TParams, TEventData>

export type DirectNodeModule<
  TParams extends ModuleParams<AnyConfigSchema<NodeConfig>> = ModuleParams<AnyConfigSchema<NodeConfig>>,
  TEventData extends ModuleEventData = ModuleEventData,
> = IndirectNodeModule<TParams, TEventData> & NodeQueryFunctions & DirectModule & { register: (module: Module) => void }

export type NodeModule<
  TParams extends ModuleParams<AnyConfigSchema<NodeConfig>> = ModuleParams<AnyConfigSchema<NodeConfig>>,
  TEventData extends NodeModuleEventData = NodeModuleEventData,
> = IndirectNodeModule<TParams, TEventData> | DirectNodeModule<TParams, TEventData>

export type NodeInstance<
  TParams extends ModuleParams<AnyConfigSchema<NodeConfig>> = ModuleParams<AnyConfigSchema<NodeConfig>>,
  TEventData extends NodeModuleEventData = NodeModuleEventData,
> = DirectNodeModule<TParams, TEventData>
