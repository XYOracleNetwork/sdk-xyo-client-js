import { Payload } from '@xyo-network/payload-model'

import { QuerySchema } from './Schema.ts'

export type QueryPayload = Payload<{
  query: string
  schema: QuerySchema
}>
