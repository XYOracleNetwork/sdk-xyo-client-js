import { XyoQueryPayload } from '@xyo-network/payload'

export type XyoArchivistDeleteQueryPayloadSchema = 'network.xyo.query.archivist.delete'
export const XyoArchivistDeleteQueryPayloadSchema = 'network.xyo.query.archivist.delete'

export type XyoArchivistDeleteQueryPayload = XyoQueryPayload<{
  schema: XyoArchivistDeleteQueryPayloadSchema
  hashes: string[]
}>
