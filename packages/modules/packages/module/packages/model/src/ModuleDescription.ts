import type { Address } from '@xylabs/sdk-js'

import type { ModuleName } from './ModuleIdentifier.ts'
export interface ModuleDescription {
  address: Address
  children?: string[]
  name?: ModuleName
  queries: string[]
}
