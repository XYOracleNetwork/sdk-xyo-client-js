import { XyoPayload } from '@xyo-network/payload'

import { XyoIdPayloadSchema } from './Schema'

export type XyoIdPayload = XyoPayload<{
  schema: XyoIdPayloadSchema
  salt: string
}>
