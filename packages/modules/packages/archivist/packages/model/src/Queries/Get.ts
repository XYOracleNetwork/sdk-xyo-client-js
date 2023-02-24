import { XyoQuery } from '@xyo-network/module-model'

export type ArchivistGetQuerySchema = 'network.xyo.query.archivist.get'
export const ArchivistGetQuerySchema: ArchivistGetQuerySchema = 'network.xyo.query.archivist.get'

export type ArchivistGetQuery = XyoQuery<{
  hashes: string[]
  schema: ArchivistGetQuerySchema
}>
