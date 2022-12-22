import { XyoPayload } from '@xyo-network/payload-model'

import { ElevationSchema } from './Schema'

export type ElevationPayload = XyoPayload<{
  elevation?: number
  schema: ElevationSchema
}>
