import { Payload } from '@xyo-network/payload-model'

import { ConfigManifest } from '../types'

export const ConfigManifestPayloadSchema = 'network.xyo.manifest.config'
export type ConfigManifestPayloadSchema = typeof ConfigManifestPayloadSchema

export type ConfigManifestPayload = Payload<ConfigManifest, ConfigManifestPayloadSchema>
