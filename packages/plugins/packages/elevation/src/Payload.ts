import { XyoPayload } from '@xyo-network/payload'

import { XyoLocationElevationSchema } from './Schema'

export type XyoLocationElevationPayload = XyoPayload<{
  elevation?: number
  quadkey?: string
  schema: XyoLocationElevationSchema
}>
