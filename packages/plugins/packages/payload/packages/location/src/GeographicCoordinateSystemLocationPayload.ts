import { Payload } from '@xyo-network/payload-model'

import { GeographicCoordinateSystemLocationSchema, QuadkeyLocationSchema } from './GeographicCoordinateSystemLocationSchema'

// Geographic Coordinate system (GCS) is the official name of lng/lat system
export interface GeographicCoordinateSystemLocation {
  accuracy?: number
  altitude?: number
  altitudeAccuracy?: number
  latitude: number
  longitude: number
}

export interface QuadkeyLocation {
  altitude?: number
  altitudeAccuracy?: number
  quadkey: string
}

export type Location = GeographicCoordinateSystemLocation | QuadkeyLocation

export type GeographicCoordinateSystemLocationPayload = Payload<GeographicCoordinateSystemLocation, GeographicCoordinateSystemLocationSchema>

export type QuadkeyLocationPayload = Payload<QuadkeyLocation, QuadkeyLocationSchema>

export type LocationPayload = Payload<Location>
