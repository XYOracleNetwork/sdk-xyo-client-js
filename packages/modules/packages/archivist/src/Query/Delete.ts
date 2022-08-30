import { XyoQueryPayload } from '@xyo-network/module'

export type XyoArchivistDeleteQueryPayloadSchema = 'network.xyo.query.archivist.delete'
export const XyoArchivistDeleteQueryPayloadSchema: XyoArchivistDeleteQueryPayloadSchema = 'network.xyo.query.archivist.delete'

export type XyoArchivistDeleteQueryPayload = XyoQueryPayload<{
  schema: XyoArchivistDeleteQueryPayloadSchema
  hashes: string[]
}>
