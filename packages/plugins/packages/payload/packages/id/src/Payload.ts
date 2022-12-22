import { XyoPayload } from '@xyo-network/payload-model'

import { IdSchema } from './Schema'

export type IdPayload = XyoPayload<{
  salt: string
  schema: IdSchema
}>
