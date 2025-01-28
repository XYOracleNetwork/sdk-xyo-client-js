import type { ModuleInstance } from './Instance.ts'
import type {
  AddressObjectFilter,
  AnyObjectFilter,
  NameObjectFilter,
  ObjectFilter,
  ObjectFilterOptions,
  QueryObjectFilter,
} from './ObjectFilter.ts'
import {
  isAddressObjectFilter,
  isNameObjectFilter,
  isQueryObjectFilter,
} from './ObjectFilter.ts'

export interface ModuleFilterOptions<T extends ModuleInstance = ModuleInstance> extends ObjectFilterOptions<T> {}

export const isAddressModuleFilter = isAddressObjectFilter<ModuleInstance>

export const isNameModuleFilter = isNameObjectFilter<ModuleInstance>

export const isQueryModuleFilter = isQueryObjectFilter<ModuleInstance>

export type AnyModuleFilter<T extends ModuleInstance = ModuleInstance> = AnyObjectFilter<T>

export type AddressModuleFilter<T extends ModuleInstance = ModuleInstance> = AddressObjectFilter<T>

export type NameModuleFilter<T extends ModuleInstance = ModuleInstance> = NameObjectFilter<T>

export type QueryModuleFilter<T extends ModuleInstance = ModuleInstance> = QueryObjectFilter<T>

/** @deprecated use ModuleIdentifier instead */
export type ModuleFilter<T extends ModuleInstance = ModuleInstance> = ObjectFilter<T>
