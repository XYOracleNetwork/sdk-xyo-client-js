import { XyoPayload } from '@xyo-network/payload'

export type CurrentLocationWitnessPayloadSchema = 'co.coinapp.currentlocationwitness'
export const CurrentLocationWitnessPayloadSchema: CurrentLocationWitnessPayloadSchema = 'co.coinapp.currentlocationwitness'

export type CurrentLocationWitnessPayload = XyoPayload<{
  altitudeMeters: number
  directionDegrees: number
  latitude: number
  longitude: number
  quadkey: string
  schema: CurrentLocationWitnessPayloadSchema
  speedKph: number
}>
