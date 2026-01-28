import { asSchema, type Query } from '@xyo-network/payload-model'

import type { ArchivistNextOptions } from '../NextOptions.ts'

export const ArchivistNextQuerySchema = asSchema('network.xyo.query.archivist.next', true)
export type ArchivistNextQuerySchema = typeof ArchivistNextQuerySchema

export type ArchivistNextQuery = Query<ArchivistNextOptions, ArchivistNextQuerySchema>
