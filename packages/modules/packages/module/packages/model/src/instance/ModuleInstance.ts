import { IsObjectFactory, ObjectTypeCheck } from '@xyo-network/object-identity'
import { Promisable } from '@xyo-network/promise'

import { AnyConfigSchema, ModuleConfig } from '../Config'
import { ModuleEventData } from '../Events'
import { Module, ModuleQueryFunctions } from '../module'
import { ModuleParams } from '../ModuleParams'

export interface ResolveFunctions<T extends ModuleInstance = ModuleInstance> {
  resolve(filter?: ModuleFilter<T>, options?: ModuleFilterOptions<T>): Promisable<T[]>
  resolve(nameOrAddress: string, options?: ModuleFilterOptions<T>): Promisable<T | undefined>
  resolve(nameOrAddressOrFilter?: ModuleFilter<T> | string, options?: ModuleFilterOptions<T>): Promisable<T | T[] | undefined>
}

export interface ModuleResolver extends ResolveFunctions {
  addResolver: (resolver: ModuleResolver) => this
  isModuleResolver: boolean
  removeResolver: (resolver: ModuleResolver) => this
}

export type ModuleInstance<
  TParams extends ModuleParams<AnyConfigSchema<ModuleConfig>> = ModuleParams<AnyConfigSchema<ModuleConfig>>,
  TEventData extends ModuleEventData = ModuleEventData,
> = Module<TParams, TEventData> &
  ResolveFunctions &
  ModuleQueryFunctions & {
    /* The resolver is a 'down' resolver.  It can resolve the module or any children (if it is a node for example), that are in the module*/
    readonly downResolver: Omit<ModuleResolver, 'resolve'>

    /* The resolver is a 'up' resolver.  It can resolve the parent or any children of the parent*/
    /* This is set by a NodeModule when attaching to the module */
    readonly upResolver: Omit<ModuleResolver, 'resolve'>
  }

export type InstanceTypeCheck<T extends ModuleInstance = ModuleInstance> = ObjectTypeCheck<T>

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
