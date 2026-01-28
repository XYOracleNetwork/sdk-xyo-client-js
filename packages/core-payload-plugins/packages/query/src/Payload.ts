import type { Payload, Schema } from '@xyo-network/payload-model'

import type { QuerySchema } from './Schema.ts'

export type QueryPayload = Payload<{
  query: Schema
  schema: QuerySchema
}>
