import { XyoPayload } from '@xyo-network/payload'

import { XyoIdSchema } from './Schema'

export type XyoIdPayload = XyoPayload<{
  salt: string
  schema: XyoIdSchema
}>
