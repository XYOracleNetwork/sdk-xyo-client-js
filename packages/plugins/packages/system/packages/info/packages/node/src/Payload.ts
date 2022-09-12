import { XyoPayload } from '@xyo-network/payload'

import { XyoNodeSystemInfoSchema } from './Schema'

export type XyoNodeSystemInfoPayload = XyoPayload<{
  schema: XyoNodeSystemInfoSchema
  systeminfo?: Record<string, unknown>
}>
