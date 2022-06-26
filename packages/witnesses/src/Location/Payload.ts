import { XyoPayload } from '@xyo-network/payload'

export interface XyoLocationPayload extends XyoPayload {
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
}
