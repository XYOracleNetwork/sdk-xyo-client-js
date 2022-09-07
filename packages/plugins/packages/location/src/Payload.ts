import { XyoPayload } from '@xyo-network/payload'

import { XyoLocationSchema } from './Schema'

export type XyoLocationPayload = XyoPayload<{
  schema: XyoLocationSchema
  currentLocation: {
    coords: {
      accuracy?: number
      altitude?: number
      altitudeAccuracy?: number
      heading?: number
      latitude?: number
      longitude?: number
      speed?: number
    }
    timestamp: number
  }
}>
