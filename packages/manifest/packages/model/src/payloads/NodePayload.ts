import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'

import { NodeManifest } from '../types'

export const NodeManifestPayloadSchema = 'network.xyo.node.manifest'
export type NodeManifestPayloadSchema = typeof NodeManifestPayloadSchema

export type NodeManifestPayload = Payload<NodeManifest, NodeManifestPayloadSchema>

export const isNodeManifestPayload = isPayloadOfSchemaType<NodeManifestPayload>(NodeManifestPayloadSchema)
