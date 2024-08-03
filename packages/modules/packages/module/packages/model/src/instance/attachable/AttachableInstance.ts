import { IsObjectFactory, TypeCheck } from '@xylabs/object'

import { ModuleEventData } from '../../EventsModels/index.ts'
import { ModuleParams } from '../../ModuleParams.ts'
import { ModuleInstance } from '../Instance.ts'
import { ModuleResolverInstance } from '../ModuleResolver.ts'

export interface AttachableModuleInstance<TParams extends ModuleParams = ModuleParams, TEventData extends ModuleEventData = ModuleEventData>
  extends ModuleInstance<TParams, TEventData> {
  /* The resolver is a 'down' resolver.  It can resolve the module or any children (if it is a node for example), that are in the module */
  readonly downResolver: ModuleResolverInstance

  // The resolver that gets called by children (usually only Nodes have this)
  readonly privateResolver: ModuleResolverInstance

  /* The resolver is a 'up' resolver.  It can resolve the parent or any children of the parent */
  /* This is set by a NodeModule when attaching to the module */
  readonly upResolver: ModuleResolverInstance
}

export type AttachableModuleInstanceTypeCheck<T extends AttachableModuleInstance = AttachableModuleInstance> = TypeCheck<T>

export class IsAttachableModuleInstanceFactory<T extends AttachableModuleInstance = AttachableModuleInstance> extends IsObjectFactory<T> {}
