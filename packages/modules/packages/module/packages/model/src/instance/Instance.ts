import { Address } from '@xylabs/hex'
import { IsObjectFactory, toJsonString, TypeCheck } from '@xylabs/object'
import { Promisable } from '@xylabs/promise'
import { AccountInstance } from '@xyo-network/account-model'

import { ModuleEventData } from '../EventsModels'
import { Module, ModuleQueryFunctions } from '../module'
import { ModuleIdentifier, ModuleName } from '../ModuleIdentifier'
import { ModuleParams } from '../ModuleParams'
import { Direction } from './ObjectFilter'
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

export interface AddressToWeakInstanceCache {
  get: (address: Address) => WeakRef<ModuleInstance> | null
  set: (address: Address, instance: WeakRef<ModuleInstance> | null) => void
}

export interface ModuleFamilyFunctions {
  account?: AccountInstance | undefined
  addParent: (module: ModuleInstance) => void
  addressCache?: (direction: Direction, includePrivate: boolean) => AddressToWeakInstanceCache | undefined
  modName?: ModuleName
  parents: () => Promisable<ModuleInstance[]>
  privateChildren: () => Promisable<ModuleInstance[]>
  publicChildren: () => Promisable<ModuleInstance[]>
  removeParent: (address: Address) => void
  siblings: () => Promisable<ModuleInstance[]>
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
