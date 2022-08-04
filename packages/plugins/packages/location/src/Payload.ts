import { XyoPayload } from '@xyo-network/payload'

import { XyoLocationPayloadSchema } from './Schema'

export type XyoLocationPayload = XyoPayload<{
  schema: XyoLocationPayloadSchema
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
