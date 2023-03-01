export interface ModuleDescription {
  address: string
  children?: string[]
  downResolve?: string[]
  name?: string
  queries: string[]
  upResolve?: string[]
}
