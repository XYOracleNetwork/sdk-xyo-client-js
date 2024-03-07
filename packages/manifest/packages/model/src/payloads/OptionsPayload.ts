import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'

import { ModuleOptionsManifest } from '../types/Options'

export const ModuleOptionsManifestPayloadSchema = 'network.xyo.manifest.module.options'
export type ModuleOptionsManifestPayloadSchema = typeof ModuleOptionsManifestPayloadSchema

export type ModuleOptionsManifestPayload = Payload<ModuleOptionsManifest, ModuleOptionsManifestPayloadSchema>

export const isModuleOptionsManifestPayload = isPayloadOfSchemaType<ModuleOptionsManifestPayload>(ModuleOptionsManifestPayloadSchema)
