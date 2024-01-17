import { Promisable } from '@xylabs/promise'
import { IsObjectFactory, TypeCheck } from '@xyo-network/object'

import { ModuleEventData } from '../EventsModels'
import { Module, ModuleQueryFunctions } from '../module'
import { ModuleParams } from '../ModuleParams'

export interface ResolveFunctions {
  resolve<T extends ModuleInstance = ModuleInstance>(filter?: ModuleFilter<T>, options?: ModuleFilterOptions<T>): Promisable<T[]>
  resolve<T extends ModuleInstance = ModuleInstance>(nameOrAddress: string, options?: ModuleFilterOptions<T>): Promisable<T | undefined>
  resolve<T extends ModuleInstance = ModuleInstance>(
    nameOrAddressOrFilter?: ModuleFilter<T> | string,
    options?: ModuleFilterOptions<T>,
  ): Promisable<T | T[] | undefined>
}

export interface ModuleResolver extends ResolveFunctions {
  addResolver: (resolver: ModuleResolver) => this
  isModuleResolver: boolean
  removeResolver: (resolver: ModuleResolver) => this
}

export interface ModuleInstance<TParams extends ModuleParams = ModuleParams, TEventData extends ModuleEventData = ModuleEventData>
  extends Module<TParams, TEventData>,
    ResolveFunctions,
    ModuleQueryFunctions {
  /* The resolver is a 'down' resolver.  It can resolve the module or any children (if it is a node for example), that are in the module*/
  readonly downResolver: Omit<ModuleResolver, 'resolve'>

  /* The resolver is a 'up' resolver.  It can resolve the parent or any children of the parent*/
  /* This is set by a NodeModule when attaching to the module */
  readonly upResolver: Omit<ModuleResolver, 'resolve'>
}

export type InstanceTypeCheck<T extends ModuleInstance = ModuleInstance> = TypeCheck<T>

export class IsInstanceFactory<T extends ModuleInstance = ModuleInstance> extends IsObjectFactory<T> {}

export interface ModuleFilterOptions<T extends ModuleInstance = ModuleInstance> {
  direction?: 'up' | 'down' | 'all'
  identity?: InstanceTypeCheck<T>
  maxDepth?: number
  visibility?: 'public' | 'private' | 'all'
}

export interface AddressModuleFilter<T extends ModuleInstance = ModuleInstance> extends ModuleFilterOptions<T> {
  address: string[]
}

export interface NameModuleFilter<T extends ModuleInstance = ModuleInstance> extends ModuleFilterOptions<T> {
  name: string[]
}

export interface QueryModuleFilter<T extends ModuleInstance = ModuleInstance> extends ModuleFilterOptions<T> {
  query: string[][]
}

export type AnyModuleFilter<T extends ModuleInstance = ModuleInstance> = Partial<AddressModuleFilter<T>> &
  Partial<NameModuleFilter<T>> &
  Partial<QueryModuleFilter<T>>

export type ModuleFilter<T extends ModuleInstance = ModuleInstance> =
  | ModuleFilterOptions<T>
  | AddressModuleFilter<T>
  | NameModuleFilter<T>
  | QueryModuleFilter<T>
