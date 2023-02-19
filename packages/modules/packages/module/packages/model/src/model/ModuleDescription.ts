export interface ModuleDescription {
  address: string
  children?: ModuleDescription[]
  name?: string
  queries: string[]
}
