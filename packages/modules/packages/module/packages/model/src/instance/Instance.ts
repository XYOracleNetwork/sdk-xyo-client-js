import type {
  Address, CreatableStatus, Promisable,
  TypeCheck,
} from '@xylabs/sdk-js'
import { IsObjectFactory, toSafeJsonString } from '@xylabs/sdk-js'
import type { AccountInstance } from '@xyo-network/account-model'

import type { ModuleEventData } from '../EventsModels/index.ts'
import type { Module, ModuleQueryFunctions } from '../module/index.ts'
import type { ModuleIdentifier, ModuleName } from '../ModuleIdentifier.ts'
import type { ModuleParams } from '../ModuleParams.ts'
import type { Direction } from './ObjectFilter.ts'
import type { ObjectResolver } from './ObjectResolver.ts'

export type ModulePipeLine = Lowercase<'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many'>

export type ModuleStatus = CreatableStatus | 'wrapped' | 'proxy'

export class DeadModuleError extends Error {
  error: Error | undefined
  id: ModuleIdentifier
  constructor(
    id: ModuleIdentifier,
    error: Error | undefined,
    msg = 'Dead Module Error',
  ) {
    super(`${msg} [${id}]: ${error?.message ?? toSafeJsonString(error)}`)
    this.id = id
    this.error = error

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, DeadModuleError.prototype)
  }
}

export interface AddressToWeakInstanceCache {
  get: (address: Address) => WeakRef<ModuleInstance> | null
  set: (address: Address, instance: WeakRef<ModuleInstance> | null) => void
}

export interface ModuleFamilyFunctions {
  account?: AccountInstance
  addParent: (mod: ModuleInstance) => void
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

  // if the module has become non-functional, such as a broken bridge connection, this will be 'dead'
  readonly status: ModuleStatus | null
}

export type InstanceTypeCheck<T extends ModuleInstance = ModuleInstance> = TypeCheck<T>

export class IsInstanceFactory<T extends ModuleInstance = ModuleInstance> extends IsObjectFactory<T> {}
