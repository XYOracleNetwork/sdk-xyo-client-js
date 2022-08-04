import { XyoPayload } from '@xyo-network/payload'

import { XyoIdPayloadSchema } from './Schema'

export interface XyoIdPayload extends XyoPayload {
  schema: XyoIdPayloadSchema
  salt: string
}
