import { IsObjectFactory, TypeCheck } from '@xylabs/object'

import { ModuleEventData } from '../EventsModels'
import { Module, ModuleQueryFunctions } from '../module'
import { ModuleParams } from '../ModuleParams'
import { ObjectResolver, ObjectResolverInstance } from './ObjectResolver'

export type ModulePipeLine = Lowercase<'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many'>

export interface ModuleInstance<TParams extends ModuleParams = ModuleParams, TEventData extends ModuleEventData = ModuleEventData>
  extends Module<TParams, TEventData>,
    ObjectResolver<ModuleInstance>,
    ModuleQueryFunctions {
  /* The resolver is a 'down' resolver.  It can resolve the module or any children (if it is a node for example), that are in the module*/
  readonly downResolver: Omit<ObjectResolverInstance<ModuleInstance>, 'resolve'>

  readonly pipeline?: ModulePipeLine

  /* The resolver is a 'up' resolver.  It can resolve the parent or any children of the parent*/
  /* This is set by a NodeModule when attaching to the module */
  readonly upResolver: Omit<ObjectResolverInstance<ModuleInstance>, 'resolve'>
}

export type InstanceTypeCheck<T extends ModuleInstance = ModuleInstance> = TypeCheck<T>

export class IsInstanceFactory<T extends ModuleInstance = ModuleInstance> extends IsObjectFactory<T> {}
