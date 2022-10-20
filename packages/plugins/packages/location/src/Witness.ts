import { Quadkey } from '@xyo-network/quadkey'
import { XyoWitness, XyoWitnessConfig } from '@xyo-network/witness'

import { XyoLocationPayload } from './Payload'
import { XyoLocationSchema } from './Schema'

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
    return this.config?.geolocation
  }

  public getCurrentPosition() {
    return new Promise<GeolocationPosition>((resolve, reject) => {
      this.geolocation?.getCurrentPosition(
        (position: GeolocationPosition) => {
          resolve(position)
        },
        (error: GeolocationPositionError) => {
          reject(error)
        },
      )
    })
  }

  override async observe(_fields: Partial<XyoLocationPayload>[]): Promise<XyoLocationPayload[]> {
    const location = await this.getCurrentPosition()
    const quadkey = Quadkey.fromLngLat({ lat: location.coords.latitude, lng: location.coords.longitude }, 32)
    const payload: XyoLocationPayload = {
      accuracy: location.coords.accuracy,
      altitude: location.coords.altitude ?? undefined,
      altitudeAccuracy: location.coords.altitudeAccuracy ?? undefined,
      heading: location.coords.heading ?? undefined,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      quadkey: quadkey?.toBase4Hash(),
      schema: XyoLocationSchema,
      speed: location.coords.speed ?? undefined,
      time: Date.now(),
    }
    return super.observe([payload])
  }

  static schema: XyoLocationSchema = XyoLocationSchema
}
