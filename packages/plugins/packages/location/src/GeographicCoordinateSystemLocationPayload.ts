import { XyoPayload } from '@xyo-network/payload'

import { GeographicCoordinateSystemLocationSchema } from './GeographicCoordinateSystemLocationSchema'

// Geographic Coordinate system (GCS) is the official name of lng/lat system
export interface GeographicCoordinateSystemLocation {
  accuracy?: number
  altitude?: number
  altitudeAccuracy?: number
  latitude: number
  longitude: number
}

export type GeographicCoordinateSystemLocationPayload = XyoPayload<GeographicCoordinateSystemLocation, GeographicCoordinateSystemLocationSchema>
