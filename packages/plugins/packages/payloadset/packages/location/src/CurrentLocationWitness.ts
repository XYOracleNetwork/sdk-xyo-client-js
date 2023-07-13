import { assertEx } from '@xylabs/assert'
import { LocationHeadingPayload, LocationHeadingSchema, LocationPayload, LocationSchema } from '@xyo-network/location-payload-plugin'
import { Payload } from '@xyo-network/payload-model'
import { AbstractWitness } from '@xyo-network/witness'

import { CurrentLocationWitnessConfigSchema, CurrentLocationWitnessParams } from './Config'

export class CurrentLocationWitness<TParams extends CurrentLocationWitnessParams = CurrentLocationWitnessParams> extends AbstractWitness<TParams> {
  static override configSchemas = [CurrentLocationWitnessConfigSchema]

  get geolocation(): Geolocation {
    return assertEx(this.params.geolocation, 'No geolocation provided')
  }

  getCurrentPosition() {
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

  protected override async observeHandler(): Promise<Payload[]> {
    const location = await this.getCurrentPosition()
    const locationPayload: LocationPayload = {
      altitude: location.coords.altitude ?? undefined,
      altitudeAccuracy: location.coords.altitudeAccuracy ?? undefined,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      schema: LocationSchema,
    }
    const heading: LocationHeadingPayload[] = location.coords.heading
      ? [
          {
            heading: location.coords.heading ?? undefined,
            schema: LocationHeadingSchema,
            speed: location.coords.speed ?? undefined,
          },
        ]
      : []
    return [locationPayload, ...heading]
  }
}
