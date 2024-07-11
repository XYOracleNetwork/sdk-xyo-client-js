import { Address } from '@xylabs/hex'

import { ModuleName } from './ModuleIdentifier.js'
export interface ModuleDescription {
  address: Address
  children?: string[]
  name?: ModuleName
  queries: string[]
}
