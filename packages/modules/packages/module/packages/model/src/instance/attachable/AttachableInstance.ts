import type { CreatableInstance, TypeCheck } from '@xylabs/sdk-js'
import { IsObjectFactory } from '@xylabs/sdk-js'

import type { ModuleEventData } from '../../EventsModels/index.ts'
import type { ModuleParams } from '../../ModuleParams.ts'
import type { ModuleInstance } from '../Instance.ts'
import type { ModuleResolverInstance } from '../ModuleResolver.ts'

export interface AttachableModuleInstance<TParams extends ModuleParams = ModuleParams, TEventData extends ModuleEventData = ModuleEventData>
  extends ModuleInstance<TParams, TEventData>, CreatableInstance<TParams, TEventData> {
  config: TParams['config']
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
