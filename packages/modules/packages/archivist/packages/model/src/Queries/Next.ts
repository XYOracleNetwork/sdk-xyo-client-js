import type { Query } from '@xyo-network/payload-model'

import type { ArchivistNextOptions } from '../NextOptions.ts'

export const ArchivistNextQuerySchema = 'network.xyo.query.archivist.next' as const
export type ArchivistNextQuerySchema = typeof ArchivistNextQuerySchema

export type ArchivistNextQuery = Query<ArchivistNextOptions, ArchivistNextQuerySchema>
