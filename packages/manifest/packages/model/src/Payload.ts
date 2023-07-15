export type ManifestPayloadSchema = 'network.xyo.manifest'
export const ManifestPayloadSchema: ManifestPayloadSchema = 'network.xyo.manifest'

export type ModuleManifestPayloadSchema = 'network.xyo.module.manifest'
export const ModuleManifestPayloadSchema: ModuleManifestPayloadSchema = 'network.xyo.module.manifest'

export type NodeManifestPayloadSchema = 'network.xyo.node.manifest'
export const NodeManifestPayloadSchema: NodeManifestPayloadSchema = 'network.xyo.node.manifest'

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

export interface NodeManifestPayload extends NodeManifest {
  schema: NodeManifestPayloadSchema
}

export interface ModuleManifest extends Manifest {
  config: ConfigManifest
  lazyStart?: boolean
}

export interface ModuleManifestPayload extends ModuleManifest {
  schema: ModuleManifestPayloadSchema | string
}

export interface ManifestPayload {
  modules?: Record<string, ModuleManifest>
  nodes: NodeManifest[]
  schema: ManifestPayloadSchema
}
