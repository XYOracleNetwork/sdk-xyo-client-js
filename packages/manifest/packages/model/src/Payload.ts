export type PackageManifestPayloadSchema = 'network.xyo.manifest.package'
export const PackageManifestPayloadSchema: PackageManifestPayloadSchema = 'network.xyo.manifest.package'

export type ModuleManifestPayloadSchema = 'network.xyo.module.manifest'
export const ModuleManifestPayloadSchema: ModuleManifestPayloadSchema = 'network.xyo.module.manifest'

export type NodeManifestPayloadSchema = 'network.xyo.node.manifest'
export const NodeManifestPayloadSchema: NodeManifestPayloadSchema = 'network.xyo.node.manifest'

import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'

export interface Manifest {
  description?: string
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
  status?: {
    address: string
  }
}

export interface ModuleManifestPayload extends ModuleManifest {
  schema: ModuleManifestPayloadSchema | string
}

export interface PackageManifest extends Manifest {
  nodes: NodeManifest[]
  schema: PackageManifestPayloadSchema
}

export type PackageManifestPayload = Payload<PackageManifest, PackageManifestPayloadSchema>

export const isPackageManifestPayload = isPayloadOfSchemaType<PackageManifestPayload>(PackageManifestPayloadSchema)
