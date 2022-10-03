import { XyoPayload } from '@xyo-network/payload'

import { XyoLocationElevationSchema } from './Schema'

export type XyoLocationElevationPayload = XyoPayload<{
  schema: XyoLocationElevationSchema
  elevation?: number
  latitude?: number
  longitude?: number
}>
