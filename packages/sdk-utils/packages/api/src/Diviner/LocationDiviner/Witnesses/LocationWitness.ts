import { Payload } from '@xyo-network/payload-model'

export const LocationWitnessSchema = 'network.xyo.location' as const
export type LocationWitnessSchema = typeof LocationWitnessSchema

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

export type LocationWitnessPayload = Payload<{
  currentLocation: CurrentLocation
  schema: LocationWitnessSchema
}>
