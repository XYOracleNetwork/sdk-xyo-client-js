import { IsObjectFactory, TypeCheck } from '@xylabs/object'

import { ModuleEventData } from '../EventsModels'
import { Module, ModuleQueryFunctions } from '../module'
import { ModuleIdentifier } from '../ModuleIdentifier'
import { ModuleParams } from '../ModuleParams'
import { ObjectResolver, ObjectResolverInstance } from './ObjectResolver'

export type ModulePipeLine = Lowercase<'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many'>

export type ModuleStatus = 'started' | 'stopped' | 'dead' | 'wrapped' | 'proxy'

export class DeadModuleError extends Error {
  constructor(
    public id: ModuleIdentifier,
    public error: Error | undefined,
    msg = 'Dead Module Error',
  ) {
    super(`${msg} [${id}]`)

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, DeadModuleError.prototype)
  }
}

export interface ModuleInstance<TParams extends ModuleParams = ModuleParams, TEventData extends ModuleEventData = ModuleEventData>
  extends Module<TParams, TEventData>,
    ObjectResolver<ModuleInstance>,
    ModuleQueryFunctions {
  /* The resolver is a 'down' resolver.  It can resolve the module or any children (if it is a node for example), that are in the module*/
  readonly downResolver: Omit<ObjectResolverInstance<ModuleInstance>, 'resolve'>

  readonly pipeline?: ModulePipeLine

  //if the module has become non-functional, such as a broken bridge connection, this will be 'dead'
  readonly status: ModuleStatus

  /* The resolver is a 'up' resolver.  It can resolve the parent or any children of the parent*/
  /* This is set by a NodeModule when attaching to the module */
  readonly upResolver: Omit<ObjectResolverInstance<ModuleInstance>, 'resolve'>
}

export type InstanceTypeCheck<T extends ModuleInstance = ModuleInstance> = TypeCheck<T>

export class IsInstanceFactory<T extends ModuleInstance = ModuleInstance> extends IsObjectFactory<T> {}
