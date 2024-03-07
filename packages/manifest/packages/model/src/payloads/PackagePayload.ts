export const PackageManifestPayloadSchema = 'network.xyo.manifest.package'
export type PackageManifestPayloadSchema = typeof PackageManifestPayloadSchema

import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'

import { PackageManifest } from '../types'

export type PackageManifestPayload = Payload<PackageManifest, PackageManifestPayloadSchema>

export const isPackageManifestPayload = isPayloadOfSchemaType<PackageManifestPayload>(PackageManifestPayloadSchema)
