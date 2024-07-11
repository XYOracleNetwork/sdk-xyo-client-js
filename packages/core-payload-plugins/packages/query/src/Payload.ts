import { Payload } from '@xyo-network/payload-model'

import { QuerySchema } from './Schema.js'

export type QueryPayload = Payload<{
  query: string
  schema: QuerySchema
}>
