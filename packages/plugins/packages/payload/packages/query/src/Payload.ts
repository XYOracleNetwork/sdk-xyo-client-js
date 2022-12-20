import { XyoPayload } from '@xyo-network/payload'

import { QuerySchema } from './Schema'

export type QueryPayload = XyoPayload<{
  query: string
  schema: QuerySchema
}>
