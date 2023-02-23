import { EmptyObject } from '@xyo-network/core'

export interface AddressModuleFilter {
  address: string[]
}

export interface NameModuleFilter {
  name: string[]
}

export interface QueryModuleFilter {
  query: string[][]
}

export type AllModuleFilter = EmptyObject

export type AnyModuleFilter = Partial<AddressModuleFilter> & Partial<NameModuleFilter> & Partial<QueryModuleFilter>
export type ModuleFilter = AddressModuleFilter | NameModuleFilter | QueryModuleFilter | AllModuleFilter
