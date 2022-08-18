import { XyoQueryPayload } from '@xyo-network/payload'

export type XyoArchivistGetQueryPayloadSchema = 'network.xyo.query.archivist.get'
export const XyoArchivistGetQueryPayloadSchema: XyoArchivistGetQueryPayloadSchema = 'network.xyo.query.archivist.get'

export type XyoArchivistGetQueryPayload = XyoQueryPayload<{
  schema: XyoArchivistGetQueryPayloadSchema
  hashes: string[]
}>
