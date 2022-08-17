import { delay } from '@xylabs/delay'
import { XyoPayload } from '@xyo-network/payload'
import { XyoWitness, XyoWitnessConfig, XyoWitnessQueryPayload } from '@xyo-network/witness'

import { XyoLocationPayload } from './Payload'
import { XyoLocationPayloadSchema } from './Schema'

export type XyoLocationWitnessConfig = XyoWitnessConfig<{
  schema: 'network.xyo.location.config'
  targetSchema: 'network.xyo.location'
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
    await delay(0)
    const location = await this.getCurrentPosition()
    return {
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
    } as XyoLocationPayload
  }

  static schema: XyoLocationPayloadSchema = XyoLocationPayloadSchema
}
