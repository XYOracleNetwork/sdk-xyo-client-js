export const DappPackageManifestPayloadSchema = 'network.xyo.manifest.package.dapp' as const
export type DappPackageManifestPayloadSchema = typeof DappPackageManifestPayloadSchema

export type PackageManifestPayloadSchema = 'network.xyo.manifest.package'
export const PackageManifestPayloadSchema: PackageManifestPayloadSchema = 'network.xyo.manifest.package'

export type ModuleManifestPayloadSchema = 'network.xyo.module.manifest'
export const ModuleManifestPayloadSchema: ModuleManifestPayloadSchema = 'network.xyo.module.manifest'

export type NodeManifestPayloadSchema = 'network.xyo.node.manifest'
export const NodeManifestPayloadSchema: NodeManifestPayloadSchema = 'network.xyo.node.manifest'

import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'

import { ModuleManifest, NodeManifest, PackageManifest } from './Manifest.ts'

export interface NodeManifestPayload extends NodeManifest {
  schema: NodeManifestPayloadSchema
}

export type ModuleManifestPayload = Payload<ModuleManifest, ModuleManifestPayloadSchema | NodeManifestPayloadSchema>

export type PackageManifestPayload = Payload<PackageManifest, PackageManifestPayloadSchema>

export const isPackageManifestPayload = isPayloadOfSchemaType<PackageManifestPayload>(PackageManifestPayloadSchema)
