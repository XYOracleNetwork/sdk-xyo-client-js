import type { Address } from '@xylabs/hex'

import type { ModuleName } from './ModuleIdentifier.ts'
export interface ModuleDescription {
  address: Address
  children?: string[]
  name?: ModuleName
  queries: string[]
}
