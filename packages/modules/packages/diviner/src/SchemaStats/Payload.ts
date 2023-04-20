import { Payload } from '@xyo-network/payload-model'

import { SchemaStatsDivinerSchema } from './Schema'

export type SchemaStatsPayload = Payload<{
  count: Record<string, number>
  //the name of the schema that the count is for.  If name is undefined, then it is the count for all schemas
  name?: string
  schema: SchemaStatsDivinerSchema
}>

export const isSchemaStatsPayload = (x?: Payload | null): x is SchemaStatsPayload => x?.schema === SchemaStatsDivinerSchema
