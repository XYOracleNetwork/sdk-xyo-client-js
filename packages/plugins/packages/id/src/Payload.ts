import { XyoPayload } from '@xyo-network/payload'

import { XyoIdSchema } from './Schema'

export type XyoIdPayload = XyoPayload<{
  schema: XyoIdSchema
  salt: string
}>
