import { WithXyoPayloadMeta, XyoPayloadBody } from '../../../../models'

export type LocationWitnessPayloadSchema = 'network.xyo.location'
export const locationWitnessPayloadSchema = 'network.xyo.location'

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

export interface LocationWitnessPayloadBody extends XyoPayloadBody {
  currentLocation: CurrentLocation
  schema: LocationWitnessPayloadSchema
}

export type LocationWitnessPayload = WithXyoPayloadMeta<LocationWitnessPayloadBody>
