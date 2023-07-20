import { InstanceTypeCheck, ModuleInstance } from './instance'

export interface ModuleFilterOptions<TInstance extends ModuleInstance = ModuleInstance> {
  direction?: 'up' | 'down' | 'all'
  identity?: InstanceTypeCheck<TInstance>
  visibility?: 'public' | 'private' | 'all'
}

export interface AddressModuleFilter<TInstance extends ModuleInstance = ModuleInstance> extends ModuleFilterOptions<TInstance> {
  address: string[]
}

export interface NameModuleFilter<TInstance extends ModuleInstance = ModuleInstance> extends ModuleFilterOptions<TInstance> {
  name: string[]
}

export interface QueryModuleFilter<TInstance extends ModuleInstance = ModuleInstance> extends ModuleFilterOptions<TInstance> {
  query: string[][]
}

export type AnyModuleFilter = Partial<AddressModuleFilter<ModuleInstance>> &
  Partial<NameModuleFilter<ModuleInstance>> &
  Partial<QueryModuleFilter<ModuleInstance>>
export type ModuleFilter<TInstance extends ModuleInstance = ModuleInstance> =
  | ModuleFilterOptions<TInstance>
  | AddressModuleFilter<TInstance>
  | NameModuleFilter<TInstance>
  | QueryModuleFilter<TInstance>
