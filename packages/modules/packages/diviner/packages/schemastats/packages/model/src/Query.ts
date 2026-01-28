import {
  asSchema, type Payload, type Query,
} from '@xyo-network/payload-model'

import { SchemaStatsDivinerSchema } from './Schema.ts'

export const SchemaStatsQuerySchema = asSchema(`${SchemaStatsDivinerSchema}.query`, true)
export type SchemaStatsQuerySchema = typeof SchemaStatsQuerySchema

export type SchemaStatsQueryPayload = Query<{ schema: SchemaStatsQuerySchema }>
export const isSchemaStatsQueryPayload = (x?: Payload | null): x is SchemaStatsQueryPayload => x?.schema === SchemaStatsQuerySchema
