import { IsObjectFactory, toJsonString, TypeCheck } from '@xylabs/object'
import { Promisable } from '@xylabs/promise'

import { ModuleEventData } from '../EventsModels'
import { Module, ModuleQueryFunctions } from '../module'
import { ModuleIdentifier, ModuleName } from '../ModuleIdentifier'
import { ModuleParams } from '../ModuleParams'
import { ObjectResolver } from './ObjectResolver'

export type ModulePipeLine = Lowercase<'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many'>

export type ModuleStatus = 'started' | 'stopped' | 'dead' | 'wrapped' | 'proxy'

export class DeadModuleError extends Error {
  constructor(
    public id: ModuleIdentifier,
    public error: Error | undefined,
    msg = 'Dead Module Error',
  ) {
    super(`${msg} [${id}]: ${error?.message ?? toJsonString(error)}`)

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, DeadModuleError.prototype)
  }
}

export interface ModuleFamilyFunctions {
  localName?: ModuleName
  parents?: () => Promisable<ModuleInstance[]>
  privateChildren?: () => Promisable<ModuleInstance[]>
  publicChildren?: () => Promisable<ModuleInstance[]>
  siblings?: () => Promisable<ModuleInstance[]>
}

export interface ModuleInstance<TParams extends ModuleParams = ModuleParams, TEventData extends ModuleEventData = ModuleEventData>
  extends Module<TParams, TEventData>,
    ObjectResolver<ModuleInstance>,
    ModuleQueryFunctions,
    ModuleFamilyFunctions {
  readonly pipeline?: ModulePipeLine

  //if the module has become non-functional, such as a broken bridge connection, this will be 'dead'
  readonly status: ModuleStatus
}

export type InstanceTypeCheck<T extends ModuleInstance = ModuleInstance> = TypeCheck<T>

export class IsInstanceFactory<T extends ModuleInstance = ModuleInstance> extends IsObjectFactory<T> {}
