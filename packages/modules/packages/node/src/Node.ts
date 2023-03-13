import { AnyObject } from '@xyo-network/core'
import { AnyConfigSchema, EventData, Module, ModuleParams } from '@xyo-network/module-model'
import { Promisable } from '@xyo-network/promise'

import { NodeConfig } from './Config'
import { ModuleAttachedEventData, ModuleDetachedEventData, ModuleRegisteredEventData } from './Events'

export interface Node {
  attach(address: string, external?: boolean): Promisable<void>
  attached(): Promisable<string[]>
  detach(address: string): Promisable<void>
  registered(): Promisable<string[]>
}

export interface NodeModuleEventData extends ModuleAttachedEventData, ModuleDetachedEventData, ModuleRegisteredEventData {}

export type NodeModuleParams<
  TConfig extends AnyConfigSchema<NodeConfig> = AnyConfigSchema<NodeConfig>,
  TEventData extends EventData | undefined = undefined,
  TAdditionalParams extends AnyObject | undefined = undefined,
> = ModuleParams<TConfig, TEventData extends EventData ? NodeModuleEventData | TEventData : NodeModuleEventData, TAdditionalParams>

export type NodeModule<TParams extends NodeModuleParams = NodeModuleParams> = Node & Module<TParams>
