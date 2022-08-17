import { XyoArchivistQueryPayload } from '../XyoArchivist'

export type XyoArchvistGetQueryPayloadSchema = 'network.xyo.query.archivist.get'
export const XyoArchvistGetQueryPayloadSchema = 'network.xyo.query.archivist.get'

export type XyoArchvistGetQueryPayload = XyoArchivistQueryPayload<{
  schema: XyoArchvistGetQueryPayloadSchema
  hashes: string[]
}>
