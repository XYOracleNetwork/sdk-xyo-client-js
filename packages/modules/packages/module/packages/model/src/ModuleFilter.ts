export interface AddressModuleFilter {
  address: string[]
}

export interface NameModuleFilter {
  name: string[]
}

export interface QueryModuleFilter {
  query: string[][]
}

export type AllModuleFilter = Record<string, never>

export type AnyModuleFilter = Partial<AddressModuleFilter> & Partial<NameModuleFilter> & Partial<QueryModuleFilter>
export type ModuleFilter = AllModuleFilter | AddressModuleFilter | NameModuleFilter | QueryModuleFilter
