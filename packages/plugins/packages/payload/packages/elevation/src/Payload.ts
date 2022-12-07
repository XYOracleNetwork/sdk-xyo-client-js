import { XyoPayload } from '@xyo-network/payload'

import { ElevationSchema } from './Schema'

export type ElevationPayload = XyoPayload<{
  elevation?: number
  schema: ElevationSchema
}>
