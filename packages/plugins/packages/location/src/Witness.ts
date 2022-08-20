import { XyoPayload } from '@xyo-network/payload'
import { XyoWitness, XyoWitnessConfig, XyoWitnessQueryPayload } from '@xyo-network/witness'

import { XyoLocationPayload } from './Payload'
import { XyoLocationPayloadSchema } from './Schema'

export type XyoLocationWitnessConfigSchema = 'network.xyo.location.config'
export const XyoLocationWitnessConfigSchema: XyoLocationWitnessConfigSchema = 'network.xyo.location.config'

export type XyoLocationWitnessConfig = XyoWitnessConfig<{
  schema: XyoLocationWitnessConfigSchema
  targetSchema: XyoLocationPayloadSchema
  geoLocation: Geolocation
}>

export class XyoLocationWitness extends XyoWitness<XyoLocationPayload> {
  private geoLocation: Geolocation
  constructor(config: XyoLocationWitnessConfig) {
    super(config)
    this.geoLocation = navigator.geolocation
  }

  public getCurrentPosition() {
    return new Promise<GeolocationPosition>((resolve, reject) => {
      this.geoLocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          resolve(position)
        },
        (error: GeolocationPositionError) => {
          reject(error)
        },
      )
    })
  }

  override async observe(
    _fields: Partial<XyoLocationPayload>,
    _query?: XyoWitnessQueryPayload<XyoPayload<{ schema: string }>> | undefined,
  ): Promise<XyoLocationPayload> {
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
