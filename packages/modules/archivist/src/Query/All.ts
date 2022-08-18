import { XyoQueryPayload } from '@xyo-network/payload'

export type XyoArchivistAllQueryPayloadSchema = 'network.xyo.query.archivist.all'
export const XyoArchivistAllQueryPayloadSchema: XyoArchivistAllQueryPayloadSchema = 'network.xyo.query.archivist.all'

export type XyoArchivistAllQueryPayload = XyoQueryPayload<{
  schema: XyoArchivistAllQueryPayloadSchema
}>
