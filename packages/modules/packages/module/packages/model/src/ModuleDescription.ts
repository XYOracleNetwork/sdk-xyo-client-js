export interface ModuleDescription {
  address: string
  children?: ModuleDescription[]
  queries: string[]
}
