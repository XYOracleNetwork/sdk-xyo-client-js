import { Hash } from '@xylabs/hex'
import { Query } from '@xyo-network/payload-model'

export const ArchivistGetQuerySchema = 'network.xyo.query.archivist.get' as const
export type ArchivistGetQuerySchema = typeof ArchivistGetQuerySchema

export type ArchivistGetQuery = Query<{
  hashes: Hash[]
  schema: ArchivistGetQuerySchema
}>
