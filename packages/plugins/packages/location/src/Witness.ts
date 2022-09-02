import { XyoWitness, XyoWitnessConfig } from '@xyo-network/witness'

import { XyoLocationPayload } from './Payload'
import { XyoLocationPayloadSchema } from './Schema'

export type XyoLocationWitnessConfigSchema = 'network.xyo.location.config'
export const XyoLocationWitnessConfigSchema: XyoLocationWitnessConfigSchema = 'network.xyo.location.config'

export type XyoLocationWitnessConfig = XyoWitnessConfig<
  XyoLocationPayload,
  {
    schema: XyoLocationWitnessConfigSchema
    geolocation: Geolocation
  }
>

export class XyoLocationWitness extends XyoWitness<XyoLocationPayload, XyoLocationWitnessConfig> {
  public get geolocation() {
    return this.config.geolocation
  }

  public getCurrentPosition() {
    return new Promise<GeolocationPosition>((resolve, reject) => {
      this.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          resolve(position)
        },
        (error: GeolocationPositionError) => {
          reject(error)
        },
      )
    })
  }

  override async observe(_fields: Partial<XyoLocationPayload>): Promise<XyoLocationPayload> {
    const location = await this.getCurrentPosition()
    return super.observe({
      currentLocation: {
        coords: {
          accuracy: location.coords.accuracy,
          altitude: location.coords.altitude ?? undefined,
          altitudeAccuracy: location.coords.altitudeAccuracy ?? undefined,
          heading: location.coords.heading ?? undefined,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          speed: location.coords.speed ?? undefined,
        },
        timestamp: location.timestamp,
      },
    })
  }

  static schema: XyoLocationPayloadSchema = XyoLocationPayloadSchema
}
