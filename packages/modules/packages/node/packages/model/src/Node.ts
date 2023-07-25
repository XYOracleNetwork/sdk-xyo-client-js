import { AnyObject } from '@xyo-network/core'
import { NodeManifestPayload } from '@xyo-network/manifest-model'
import { AnyConfigSchema, Module, ModuleEventData, ModuleInstance, ModuleParams } from '@xyo-network/module-model'
import { Promisable } from '@xyo-network/promise'

import { NodeConfig } from './Config'
import { ModuleAttachedEventData, ModuleDetachedEventData, ModuleRegisteredEventData, ModuleUnregisteredEventData } from './Events'

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

export type NodeModuleParams<
  TConfig extends AnyConfigSchema<NodeConfig> = AnyConfigSchema<NodeConfig>,
  TAdditionalParams extends AnyObject | undefined = undefined,
> = ModuleParams<TConfig, TAdditionalParams>

export type NodeModule<
  TParams extends ModuleParams<AnyConfigSchema<NodeConfig>> = ModuleParams<AnyConfigSchema<NodeConfig>>,
  TEventData extends NodeModuleEventData = NodeModuleEventData,
> = Module<TParams, TEventData>

export type NodeInstance<
  TParams extends ModuleParams<AnyConfigSchema<NodeConfig>> = ModuleParams<AnyConfigSchema<NodeConfig>>,
  TEventData extends NodeModuleEventData = NodeModuleEventData,
> = NodeModule<TParams, TEventData> &
  NodeQueryFunctions &
  ModuleInstance & {
    register: (module: ModuleInstance) => void
  }
