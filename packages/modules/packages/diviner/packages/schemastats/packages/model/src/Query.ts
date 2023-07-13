import { Payload, Query } from '@xyo-network/payload-model'

import { SchemaStatsDivinerSchema } from './Schema'

export type SchemaStatsQuerySchema = `${SchemaStatsDivinerSchema}.query`
export const SchemaStatsQuerySchema: SchemaStatsQuerySchema = `${SchemaStatsDivinerSchema}.query`

export type SchemaStatsQueryPayload = Query<{ schema: SchemaStatsQuerySchema }>
export const isSchemaStatsQueryPayload = (x?: Payload | null): x is SchemaStatsQueryPayload => x?.schema === SchemaStatsQuerySchema
