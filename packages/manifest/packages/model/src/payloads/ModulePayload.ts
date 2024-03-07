export const ModuleManifestPayloadSchema = 'network.xyo.module.manifest'
export type ModuleManifestPayloadSchema = typeof ModuleManifestPayloadSchema

import { Payload } from '@xyo-network/payload-model'

import { ModuleManifest } from '../types'

export type ModuleManifestPayload = Payload<ModuleManifest, ModuleManifestPayloadSchema>
