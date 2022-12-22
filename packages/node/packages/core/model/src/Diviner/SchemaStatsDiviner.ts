import { AbstractDiviner } from '@xyo-network/diviner'
import { XyoPayload } from '@xyo-network/payload-model'

import { ArchiveQueryPayload } from './ArchiveQueryPayload'
import { ArchivistPayloadStatsDivinerConfig } from './PayloadStatsDiviner'

export type SchemaStatsSchema = 'network.xyo.archivist.schema.stats'
export const SchemaStatsSchema: SchemaStatsSchema = 'network.xyo.archivist.schema.stats'

export type SchemaStatsQuerySchema = 'network.xyo.archivist.schema.stats.query'
export const SchemaStatsQuerySchema: SchemaStatsQuerySchema = 'network.xyo.archivist.schema.stats.query'

export type SchemaStatsConfigSchema = 'network.xyo.archivist.schema.stats.config'
export const SchemaStatsConfigSchema: SchemaStatsConfigSchema = 'network.xyo.archivist.schema.stats.config'

export type SchemaStatsDivinerConfig<
  S extends string = SchemaStatsConfigSchema,
  T extends XyoPayload = XyoPayload,
> = ArchivistPayloadStatsDivinerConfig<
  S,
  T & {
    schema: S
  }
>

export type SchemaStatsPayload = XyoPayload<{ count: Record<string, number>; schema: SchemaStatsSchema }>
export const isSchemaStatsPayload = (x?: XyoPayload | null): x is SchemaStatsPayload => x?.schema === SchemaStatsSchema

export type SchemaStatsQueryPayload = ArchiveQueryPayload<{ schema: SchemaStatsQuerySchema }>
export const isSchemaStatsQueryPayload = (x?: XyoPayload | null): x is SchemaStatsQueryPayload => x?.schema === SchemaStatsQuerySchema

export type SchemaStatsDiviner = AbstractDiviner
