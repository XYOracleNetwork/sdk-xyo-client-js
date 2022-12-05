import { XyoPayload } from '@xyo-network/payload'

import { GeographicLocationSchema } from './GeographicLocationSchema'

// Geographic Coordinate system (GCS) is the official name of lng/lat system
export interface GeographicCoordinates {
  latitude: number
  longitude: number
  radius?: number
}

export interface Quadkey {
  quadkey: string
}

export interface Altitude {
  altitude: number
}

export type GeographicLocation = (GeographicCoordinates | Quadkey) & Partial<Altitude>

export type GeographicLocationPayload = XyoPayload<GeographicLocation, GeographicLocationSchema>
