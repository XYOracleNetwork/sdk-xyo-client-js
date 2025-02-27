import type { Payload } from '@xyo-network/payload-model'

export const CurrentLocationWitnessSchema = 'co.coinapp.currentlocationwitness' as const
export type CurrentLocationWitnessSchema = typeof CurrentLocationWitnessSchema

export type CurrentLocationWitnessPayload = Payload<{
  altitudeMeters: number
  directionDegrees: number
  latitude: number
  longitude: number
  quadkey: string
  schema: CurrentLocationWitnessSchema
  speedKph: number
}>
