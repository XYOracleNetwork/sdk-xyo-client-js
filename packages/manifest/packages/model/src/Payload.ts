export const DappPackageManifestPayloadSchema = asSchema('network.xyo.manifest.package.dapp', true)
export type DappPackageManifestPayloadSchema = typeof DappPackageManifestPayloadSchema

export const PackageManifestPayloadSchema = asSchema('network.xyo.manifest.package', true)
export type PackageManifestPayloadSchema = typeof PackageManifestPayloadSchema

export const ModuleManifestPayloadSchema = asSchema('network.xyo.module.manifest', true)
export type ModuleManifestPayloadSchema = typeof ModuleManifestPayloadSchema

export const NodeManifestPayloadSchema = asSchema('network.xyo.node.manifest', true)
export type NodeManifestPayloadSchema = typeof NodeManifestPayloadSchema

import type { Payload } from '@xyo-network/payload-model'
import { asSchema, isPayloadOfSchemaType } from '@xyo-network/payload-model'

import type {
  ModuleManifest, NodeManifest, PackageManifest,
} from './Manifest.ts'

export interface NodeManifestPayload extends NodeManifest {
  schema: NodeManifestPayloadSchema
}

export type ModuleManifestPayload = Payload<ModuleManifest, ModuleManifestPayloadSchema | NodeManifestPayloadSchema>

export type PackageManifestPayload = Payload<PackageManifest, PackageManifestPayloadSchema>

export const isPackageManifestPayload = isPayloadOfSchemaType<PackageManifestPayload>(PackageManifestPayloadSchema)
