import { XyoQueryPayload } from '@xyo-network/payload'

export type XyoArchivistClearQueryPayloadSchema = 'network.xyo.query.archivist.clear'
export const XyoArchivistClearQueryPayloadSchema = 'network.xyo.query.archivist.clear'

export type XyoArchivistClearQueryPayload = XyoQueryPayload<{
  schema: XyoArchivistClearQueryPayloadSchema
}>
