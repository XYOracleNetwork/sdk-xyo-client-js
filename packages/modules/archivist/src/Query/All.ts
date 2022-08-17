import { XyoArchivistQueryPayload } from '../XyoArchivist'

export type XyoArchvistAllQueryPayloadSchema = 'network.xyo.query.archivist.all'
export const XyoArchvistAllQueryPayloadSchema = 'network.xyo.query.archivist.all'

export type XyoArchvistAllQueryPayload = XyoArchivistQueryPayload<{
  schema: XyoArchvistAllQueryPayloadSchema
}>
