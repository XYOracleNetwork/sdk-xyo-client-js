import { assertEx } from '@xylabs/assert'
import { XyoModuleParams } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'
import { AbstractWitness, XyoWitnessConfig } from '@xyo-network/witness'

import { LocationPayload } from './GeographicCoordinateSystemLocationPayload'
import { LocationSchema } from './GeographicCoordinateSystemLocationSchema'
import { LocationHeadingPayload } from './HeadingPayload'
import { LocationHeadingSchema } from './HeadingSchema'

export type CurrentLocationWitnessConfigSchema = 'network.xyo.location.current.config'
export const CurrentLocationWitnessConfigSchema: CurrentLocationWitnessConfigSchema = 'network.xyo.location.current.config'

export type CurrentLocationWitnessConfig = XyoWitnessConfig<{
  schema: CurrentLocationWitnessConfigSchema
}>

export type CurrentLocationWitnessParams = XyoModuleParams<CurrentLocationWitnessConfig> & { geolocation: Geolocation }

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

  static override async create(params?: XyoModuleParams<CurrentLocationWitnessConfig>): Promise<CurrentLocationWitness> {
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

  override async observe(_fields: XyoPayload[]): Promise<XyoPayload[]> {
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
