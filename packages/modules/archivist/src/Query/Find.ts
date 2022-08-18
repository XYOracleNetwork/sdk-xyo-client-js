import { XyoQueryPayload } from '@xyo-network/payload'

import { XyoPayloadFindFilter } from '../XyoPayloadFindFilter'

export type XyoArchivistFindQueryPayloadSchema = 'network.xyo.query.archivist.find'
export const XyoArchivistFindQueryPayloadSchema: XyoArchivistFindQueryPayloadSchema = 'network.xyo.query.archivist.find'

export type XyoArchivistFindQueryPayload = XyoQueryPayload<{
  schema: XyoArchivistFindQueryPayloadSchema
  filter: XyoPayloadFindFilter
}>
