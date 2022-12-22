import { XyoPayload } from '@xyo-network/payload-model'

export type LocationWitnessSchema = 'network.xyo.location'
export const LocationWitnessSchema: LocationWitnessSchema = 'network.xyo.location'

export interface Coordinates {
  accuracy: number | null
  altitude: number | null
  altitudeAccuracy: number | null
  heading: number | null
  latitude: number
  longitude: number
  speed: number | null
}
export interface CurrentLocation {
  coords: Coordinates
  timestamp: number
}

export type LocationWitnessPayload = XyoPayload<{
  currentLocation: CurrentLocation
  schema: LocationWitnessSchema
}>
