import { XyoPayload } from '@xyo-network/payload'

import { XyoNodeSystemInfoPayloadSchema } from './Schema'

export type XyoNodeSystemInfoPayload = XyoPayload<{
  schema: XyoNodeSystemInfoPayloadSchema
  systeminfo?: Record<string, unknown>
}>
