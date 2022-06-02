import { XyoLegacyWitness } from '@xyo-network/core'

import { XyoLocationPayload } from './Payload'
import { locationTemplate } from './Template'

export class XyoLocationWitness extends XyoLegacyWitness<XyoLocationPayload> {
  private geoLocation: Geolocation
  constructor() {
    const template = locationTemplate()
    super({
      schema: template.schema,
      template,
    })
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
        }
      )
    })
  }

  override async observe() {
    const location = await this.getCurrentPosition()
    return await super.observe({
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
}
