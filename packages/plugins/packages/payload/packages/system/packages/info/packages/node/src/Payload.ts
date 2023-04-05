import { Payload } from '@xyo-network/payload-model'

import { XyoNodeSystemInfoSchema } from './Schema'

export type XyoNodeSystemInfoPayload = Payload<{
  schema: XyoNodeSystemInfoSchema
  systeminfo?: Record<string, unknown>
}>
