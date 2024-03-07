import { ModuleManifest } from './Module'

export type NodeManifest = ModuleManifest & {
  modules?: {
    private?: ModuleManifest[]
    public?: ModuleManifest[]
  }
}
