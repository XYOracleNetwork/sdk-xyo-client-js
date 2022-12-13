import { assertEx } from '@xylabs/assert'
import { LocationHeadingPayload, LocationHeadingSchema, LocationPayload, LocationSchema } from '@xyo-network/location-payload-plugin'
import { ModuleParams } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'
import { AbstractWitness } from '@xyo-network/witness'

import { CurrentLocationWitnessConfig, CurrentLocationWitnessConfigSchema, CurrentLocationWitnessParams } from './Config'

export class CurrentLocationWitness extends AbstractWitness<CurrentLocationWitnessConfig> {
  static override configSchema = CurrentLocationWitnessConfigSchema

  private _geolocation: Geolocation

  constructor(params: CurrentLocationWitnessParams) {
    super(params)
    this._geolocation = params?.geolocation
  }

  public get geolocation(): Geolocation {
    return assertEx(this._geolocation, 'No geolocation provided')
  }

  static override async create(params?: ModuleParams<CurrentLocationWitnessConfig>): Promise<CurrentLocationWitness> {
    return (await super.create(params)) as CurrentLocationWitness
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

  override async observe(): Promise<XyoPayload[]> {
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
    return super.observe([locationPayload, ...heading])
  }
}
