import { Manifest } from './Manifest'

export type ModuleOptionsManifest = Manifest & {
  features?: string[]
  labels?: Record<string, string | undefined>
  language?: string
  lazyStart?: boolean
  os?: string
}
