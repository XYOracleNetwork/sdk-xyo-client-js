import { AbstractDiviner } from '@xyo-network/diviner'
import { Query } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { ArchivistPayloadStatsDivinerConfig } from './PayloadStatsDiviner'

export type SchemaStatsSchema = 'network.xyo.archivist.schema.stats'
export const SchemaStatsSchema: SchemaStatsSchema = 'network.xyo.archivist.schema.stats'

export type SchemaStatsQuerySchema = 'network.xyo.archivist.schema.stats.query'
export const SchemaStatsQuerySchema: SchemaStatsQuerySchema = 'network.xyo.archivist.schema.stats.query'

export type SchemaStatsConfigSchema = 'network.xyo.archivist.schema.stats.config'
export const SchemaStatsConfigSchema: SchemaStatsConfigSchema = 'network.xyo.archivist.schema.stats.config'

export type SchemaStatsDivinerConfig<S extends string = SchemaStatsConfigSchema, T extends Payload = Payload> = ArchivistPayloadStatsDivinerConfig<
  S,
  T & {
    schema: S
  }
>

export type SchemaStatsPayload = Payload<{
  count: Record<string, number>
  //the name of the schema that the count is for.  If name is undefined, then it is the count for all schemas
  name?: string
  schema: SchemaStatsSchema
}>

export const isSchemaStatsPayload = (x?: Payload | null): x is SchemaStatsPayload => x?.schema === SchemaStatsSchema

export type SchemaStatsQueryPayload = Query<{ schema: SchemaStatsQuerySchema }>
export const isSchemaStatsQueryPayload = (x?: Payload | null): x is SchemaStatsQueryPayload => x?.schema === SchemaStatsQuerySchema

export type SchemaStatsDiviner = AbstractDiviner
