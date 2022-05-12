import { WithXyoPayloadMeta, XyoPayloadBody } from '@xyo-network/core'

export const currentLocationWitnessPayloadSchema = 'co.coinapp.currentlocationwitness'
export type CurrentLocationWitnessPayloadSchema = 'co.coinapp.currentlocationwitness'

export interface CurrentLocationWitnessPayloadBody extends XyoPayloadBody {
  altitudeMeters: number
  directionDegrees: number
  latitude: number
  longitude: number
  quadkey: string
  schema: CurrentLocationWitnessPayloadSchema
  speedKph: number
}

export declare type CurrentLocationWitnessPayload = WithXyoPayloadMeta<CurrentLocationWitnessPayloadBody>
