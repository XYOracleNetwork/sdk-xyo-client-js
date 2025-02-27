export const DappPackageManifestPayloadSchema = 'network.xyo.manifest.package.dapp' as const
export type DappPackageManifestPayloadSchema = typeof DappPackageManifestPayloadSchema

export const PackageManifestPayloadSchema = 'network.xyo.manifest.package' as const
export type PackageManifestPayloadSchema = typeof PackageManifestPayloadSchema

export const ModuleManifestPayloadSchema = 'network.xyo.module.manifest' as const
export type ModuleManifestPayloadSchema = typeof ModuleManifestPayloadSchema

export const NodeManifestPayloadSchema = 'network.xyo.node.manifest' as const
export type NodeManifestPayloadSchema = typeof NodeManifestPayloadSchema

import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'

import {
  ModuleManifest, NodeManifest, PackageManifest,
} from './Manifest.ts'

export interface NodeManifestPayload extends NodeManifest {
  schema: NodeManifestPayloadSchema
}

export type ModuleManifestPayload = Payload<ModuleManifest, ModuleManifestPayloadSchema | NodeManifestPayloadSchema>

export type PackageManifestPayload = Payload<PackageManifest, PackageManifestPayloadSchema>

export const isPackageManifestPayload = isPayloadOfSchemaType<PackageManifestPayload>(PackageManifestPayloadSchema)
