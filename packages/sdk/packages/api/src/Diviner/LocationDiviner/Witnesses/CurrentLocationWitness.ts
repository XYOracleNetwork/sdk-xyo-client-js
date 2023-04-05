import { Payload } from '@xyo-network/payload-model'

export type CurrentLocationWitnessSchema = 'co.coinapp.currentlocationwitness'
export const CurrentLocationWitnessSchema: CurrentLocationWitnessSchema = 'co.coinapp.currentlocationwitness'

export type CurrentLocationWitnessPayload = Payload<{
  altitudeMeters: number
  directionDegrees: number
  latitude: number
  longitude: number
  quadkey: string
  schema: CurrentLocationWitnessSchema
  speedKph: number
}>
