import { Address } from '@xylabs/hex'

import { ModuleName } from './ModuleIdentifier'
export interface ModuleDescription {
  address: Address
  children?: string[]
  name?: ModuleName
  queries: string[]
}
