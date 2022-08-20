import { XyoDivinerQueryPayload } from '../Diviner'

export type XyoSequenceDivinerQueryPayloadSchema = 'network.xyo.diviner.sequence.query'
export const XyoSequenceDivinerQueryPayloadSchema: XyoSequenceDivinerQueryPayloadSchema = 'network.xyo.diviner.sequence.query'

export type XyoSequenceDivinerQueryPayload = XyoDivinerQueryPayload<
  XyoSequenceDivinerQueryPayloadSchema,
  {
    schema: XyoSequenceDivinerQueryPayloadSchema
    payload_hashes: string[]
    payload_schemas: string[]
  }
>
