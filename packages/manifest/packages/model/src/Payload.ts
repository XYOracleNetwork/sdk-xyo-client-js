export type ManifestPayloadSchema = 'network.xyo.manifest'
export const ManifestPayloadSchema: ManifestPayloadSchema = 'network.xyo.manifest'

export interface Manifest {
  description?: string
}

export interface ConfigManifest {
  accountPath?: string
  features?: string[]
  language?: string
  name: string
  os?: string
  schema: string
}

export interface NodeManifest extends ModuleManifest {
  modules?: {
    private?: ModuleManifest[]
    public?: ModuleManifest[]
  }
}

export interface ModuleManifest extends Manifest {
  config: ConfigManifest
}

export interface ManifestPayload {
  modules?: Record<string, ModuleManifest>
  nodes: NodeManifest[]
  schema: ManifestPayloadSchema
}
