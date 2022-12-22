import { XyoPayload } from '@xyo-network/payload-model'

import { QuerySchema } from './Schema'

export type QueryPayload = XyoPayload<{
  query: string
  schema: QuerySchema
}>
