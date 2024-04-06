import { IsObjectFactory, toJsonString, TypeCheck } from '@xylabs/object'

import { AnyConfigSchema, ModuleConfig } from '../Config'
import { ModuleEventData } from '../EventsModels'
import { Module, ModuleQueryFunctions } from '../module'
import { ModuleIdentifier } from '../ModuleIdentifier'
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

export interface ModuleInstance<
  TConfig extends AnyConfigSchema<ModuleConfig> = AnyConfigSchema<ModuleConfig>,
  TEventData extends ModuleEventData = ModuleEventData,
> extends Module<TConfig, TEventData>,
    ObjectResolver<ModuleInstance>,
    ModuleQueryFunctions {
  readonly pipeline?: ModulePipeLine

  //if the module has become non-functional, such as a broken bridge connection, this will be 'dead'
  readonly status: ModuleStatus
}

export type InstanceTypeCheck<T extends ModuleInstance = ModuleInstance> = TypeCheck<T>

export class IsInstanceFactory<T extends ModuleInstance = ModuleInstance> extends IsObjectFactory<T> {}
