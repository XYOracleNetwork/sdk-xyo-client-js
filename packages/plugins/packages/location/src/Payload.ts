import { XyoPayload } from '@xyo-network/payload'

import { XyoLocationSchema } from './Schema'

export interface LngLatPhysicalLocation {
  accuracy?: number
  latitude: number
  longitude: number
}

export interface QuadkeyPhysicalLocation {
  quadkey: string
}

export interface AltitudePhysicalLocation {
  altitude?: number
  altitudeAccuracy?: number
}

export type PhysicalLocation = (LngLatPhysicalLocation | QuadkeyPhysicalLocation) & AltitudePhysicalLocation

export type VectorLocation = {
  heading?: number
  speed?: number
}

export interface TemporalLocation {
  time?: number
}

export type CompleteLocation = PhysicalLocation & TemporalLocation & VectorLocation

export type XyoLocationPayload = XyoPayload<{ schema: XyoLocationSchema } & CompleteLocation>
