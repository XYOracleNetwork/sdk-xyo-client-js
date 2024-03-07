import { Manifest } from './Manifest'

export interface ModuleOptionsManifest extends Manifest {
  features?: string[]
  labels?: Record<string, string | undefined>
  language?: string
  lazyStart?: boolean
  os?: string
}
