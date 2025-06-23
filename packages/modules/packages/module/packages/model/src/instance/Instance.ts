import type { CreatableInstance } from '@xylabs/creatable'
import type { Address } from '@xylabs/hex'
import type { TypeCheck } from '@xylabs/object'
import { IsObjectFactory, toJsonString } from '@xylabs/object'
import type { Promisable } from '@xylabs/promise'
import type { AccountInstance } from '@xyo-network/account-model'

import type { ModuleEventData } from '../EventsModels/index.ts'
import type { Module, ModuleQueryFunctions } from '../module/index.ts'
import type { ModuleIdentifier, ModuleName } from '../ModuleIdentifier.ts'
import type { ModuleParams } from '../ModuleParams.ts'
import type { Direction } from './ObjectFilter.ts'
import type { ObjectResolver } from './ObjectResolver.ts'

export type ModulePipeLine = Lowercase<'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many'>

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

export type ModuleInstance<TParams extends ModuleParams = ModuleParams, TEventData extends ModuleEventData = ModuleEventData>
  = Module<TParams, TEventData> &
    ObjectResolver<ModuleInstance> &
    ModuleQueryFunctions &
    ModuleFamilyFunctions & {
      readonly pipeline?: ModulePipeLine
    }

export type InstanceTypeCheck<T extends ModuleInstance = ModuleInstance> = TypeCheck<T>

export class IsInstanceFactory<T extends ModuleInstance = ModuleInstance> extends IsObjectFactory<T> {}
