import { XyoPayload } from '@xyo-network/payload'

import { XyoElevationSchema } from './Schema'

export type XyoElevationPayload = XyoPayload<{
  schema: XyoElevationSchema
  elevation?: number
  latitude?: number
  longitude?: number
}>
