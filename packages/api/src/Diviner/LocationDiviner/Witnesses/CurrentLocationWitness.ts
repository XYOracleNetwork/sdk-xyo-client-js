import { XyoPayload, XyoPayloadMeta } from '@xyo-network/payload'

export const currentLocationWitnessPayloadSchema = 'co.coinapp.currentlocationwitness'
export type CurrentLocationWitnessPayloadSchema = 'co.coinapp.currentlocationwitness'

export interface CurrentLocationWitnessPayloadBody extends XyoPayload {
  altitudeMeters: number
  directionDegrees: number
  latitude: number
  longitude: number
  quadkey: string
  schema: CurrentLocationWitnessPayloadSchema
  speedKph: number
}

export declare type CurrentLocationWitnessPayload = XyoPayloadMeta<CurrentLocationWitnessPayloadBody>
