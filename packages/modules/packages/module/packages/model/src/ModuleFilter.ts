export interface ModuleFilterOptions {
  direction?: 'up' | 'down' | 'all'
  visibility?: 'public' | 'private' | 'all'
}

export interface AddressModuleFilter extends ModuleFilterOptions {
  address: string[]
}

export interface NameModuleFilter extends ModuleFilterOptions {
  name: string[]
}

export interface QueryModuleFilter extends ModuleFilterOptions {
  query: string[][]
}

export type AnyModuleFilter = Partial<AddressModuleFilter> & Partial<NameModuleFilter> & Partial<QueryModuleFilter>
export type ModuleFilter = ModuleFilterOptions | AddressModuleFilter | NameModuleFilter | QueryModuleFilter
