import { XyoPayload } from '@xyo-network/payload'

import { IdSchema } from './Schema'

export type IdPayload = XyoPayload<{
  salt: string
  schema: IdSchema
}>
