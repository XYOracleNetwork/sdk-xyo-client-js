import { IsObjectFactory, TypeCheck } from '@xylabs/object'

import { AnyConfigSchema, ModuleConfig } from '../../Config'
import { ModuleEventData } from '../../EventsModels'
import { ModuleInstance } from '../Instance'
import { ModuleResolverInstance } from '../ModuleResolver'

export interface AttachableModuleInstance<
  TConfig extends AnyConfigSchema<ModuleConfig> = AnyConfigSchema<ModuleConfig>,
  TEventData extends ModuleEventData = ModuleEventData,
> extends ModuleInstance<TConfig, TEventData> {
  /* The resolver is a 'down' resolver.  It can resolve the module or any children (if it is a node for example), that are in the module*/
  readonly downResolver: ModuleResolverInstance

  // The resolver that gets called by children (usually only Nodes have this)
  readonly privateResolver: ModuleResolverInstance

  /* The resolver is a 'up' resolver.  It can resolve the parent or any children of the parent*/
  /* This is set by a NodeModule when attaching to the module */
  readonly upResolver: ModuleResolverInstance
}

export type AttachableModuleInstanceTypeCheck<T extends AttachableModuleInstance = AttachableModuleInstance> = TypeCheck<T>

export class IsAttachableModuleInstanceFactory<T extends AttachableModuleInstance = AttachableModuleInstance> extends IsObjectFactory<T> {}
