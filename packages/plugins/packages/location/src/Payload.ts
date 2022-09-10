import { XyoPayload } from '@xyo-network/payload'

import { XyoLocationSchema } from './Schema'

export type XyoLocationPayload = XyoPayload<{
  schema: XyoLocationSchema
  accuracy?: number
  altitude?: number
  altitudeAccuracy?: number
  heading?: number
  latitude?: number
  longitude?: number
  speed?: number
  time?: number
}>
