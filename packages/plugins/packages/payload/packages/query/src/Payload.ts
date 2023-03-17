import { Payload } from '@xyo-network/payload-model'

import { QuerySchema } from './Schema'

export type QueryPayload = Payload<{
  query: string
  schema: QuerySchema
}>
