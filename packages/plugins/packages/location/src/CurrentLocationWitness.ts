import { assertEx } from '@xylabs/assert'
import { XyoModuleParams } from '@xyo-network/module'
import { Quadkey } from '@xyo-network/quadkey'
import { AbstractWitness, XyoWitnessConfig } from '@xyo-network/witness'

export type CurrentLocationWitnessConfigSchema = 'network.xyo.location.current.config'
export const CurrentLocationWitnessConfigSchema: CurrentLocationWitnessConfigSchema = 'network.xyo.location.current.config'

export type CurrentLocationWitnessConfig = XyoWitnessConfig<
  CurrentLocationPayloadSet,
  {
    schema: CurrentLocationWitnessConfigSchema
  }
>

export type XyoLocationWitnessParams = XyoModuleParams<XyoLocationWitnessConfig> & { geolocation: Geolocation }

export class XyoLocationWitness extends AbstractWitness<XyoLocationPayload, XyoLocationWitnessConfig> {
  static override configSchema = XyoLocationWitnessConfigSchema
  static override targetSchema = XyoLocationSchema

  private _geolocation: Geolocation

  constructor(params: XyoLocationWitnessParams) {
    super(params)
    this._geolocation = params?.geolocation
  }

  public get geolocation(): Geolocation {
    return assertEx(this._geolocation, 'No geolocation provided')
  }

  static override async create(params?: XyoModuleParams<XyoLocationWitnessConfig>): Promise<XyoLocationWitness> {
    return (await super.create(params)) as XyoLocationWitness
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
      quadkey: quadkey?.base4Hash,
      schema: XyoLocationSchema,
      speed: location.coords.speed ?? undefined,
      time: Date.now(),
    }
    return super.observe([payload])
  }
}
