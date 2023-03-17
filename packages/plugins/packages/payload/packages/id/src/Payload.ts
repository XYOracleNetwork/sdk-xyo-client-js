import { Payload } from '@xyo-network/payload-model'

import { IdSchema } from './Schema'

export type IdPayload = Payload<{
  salt: string
  schema: IdSchema
}>
