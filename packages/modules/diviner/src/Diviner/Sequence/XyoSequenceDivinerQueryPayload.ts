import { XyoQueryPayload } from '@xyo-network/payload'

export type XyoSequenceDivinerQueryPayloadSchema = 'network.xyo.diviner.sequence.query'
export const XyoSequenceDivinerQueryPayloadSchema: XyoSequenceDivinerQueryPayloadSchema = 'network.xyo.diviner.sequence.query'

export type XyoSequenceDivinerQueryPayload = XyoQueryPayload<{
  schema: XyoSequenceDivinerQueryPayloadSchema
  payload_hashes: string[]
  payload_schemas: string[]
}>
