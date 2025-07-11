import type { Address } from '@xylabs/hex'
import { isObject } from '@xylabs/object'

export type ModuleAlias = Exclude<string, 'reserved-alias-value-8346534876'>

export interface Manifest {
  description?: string
}

export const isManifest = (value: unknown): value is Manifest => {
  return isObject(value)
}

export interface ConfigManifest {
  accountPath?: string
  features?: string[]
  labels?: Record<string, string | undefined>
  language?: string
  name: string
  os?: string
  schema: string
}

export interface NodeManifest extends ModuleManifest {
  modules?: {
    private?: (ModuleManifest | ModuleAlias)[]
    public?: (ModuleManifest | ModuleAlias)[]
  }
}

export interface ModuleManifest extends Manifest {
  config: ConfigManifest
  lazyStart?: boolean
  status?: {
    address: Address
    children?: Record<Address, string | null>
  }
}

export interface PackageManifest extends Manifest {
  modules?: Record<ModuleAlias, ModuleManifest>
  nodes: NodeManifest[]
}
