import { XyoPayload, XyoQueryPayload } from '@xyo-network/payload'

export type XyoArchivistInsertQueryPayloadSchema = 'network.xyo.query.archivist.insert'
export const XyoArchivistInsertQueryPayloadSchema = 'network.xyo.query.archivist.insert'

export type XyoArchivistInsertQueryPayload = XyoQueryPayload<{
  schema: XyoArchivistInsertQueryPayloadSchema
  payloads: XyoPayload[]
}>
