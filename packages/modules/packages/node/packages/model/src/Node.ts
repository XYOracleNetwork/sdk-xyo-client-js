import { AnyObject } from '@xyo-network/core'
import { AnyConfigSchema, Module, ModuleEventData, ModuleParams } from '@xyo-network/module-model'
import { Promisable } from '@xyo-network/promise'

import { NodeConfig } from './Config'
import { ModuleAttachedEventData, ModuleDetachedEventData, ModuleRegisteredEventData } from './Events'

export interface Node {
  attach(address: string, external?: boolean): Promisable<void>
  attached(): Promisable<string[]>
  detach(address: string): Promisable<void>
  registered(): Promisable<string[]>
}

export interface NodeModuleEventData extends ModuleAttachedEventData, ModuleDetachedEventData, ModuleRegisteredEventData, ModuleEventData {}

export type NodeModuleParams<
  TConfig extends AnyConfigSchema<NodeConfig> = AnyConfigSchema<NodeConfig>,
  TAdditionalParams extends AnyObject | undefined = undefined,
> = ModuleParams<TConfig, TAdditionalParams>

export type NodeModule<TParams extends NodeModuleParams = NodeModuleParams, TEventData extends NodeModuleEventData = NodeModuleEventData> = Node &
  Module<TParams, TEventData>
