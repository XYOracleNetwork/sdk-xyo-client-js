import type { Payload } from '@xyo-network/payload-model'

import type { QuerySchema } from './Schema.ts'

export type QueryPayload = Payload<{
  query: string
  schema: QuerySchema
}>
