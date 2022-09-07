import { XyoPayload } from '@xyo-network/payload'

export type CurrentLocationWitnessSchema = 'co.coinapp.currentlocationwitness'
export const CurrentLocationWitnessSchema: CurrentLocationWitnessSchema = 'co.coinapp.currentlocationwitness'

export type CurrentLocationWitnessPayload = XyoPayload<{
  altitudeMeters: number
  directionDegrees: number
  latitude: number
  longitude: number
  quadkey: string
  schema: CurrentLocationWitnessSchema
  speedKph: number
}>
