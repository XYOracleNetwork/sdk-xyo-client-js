import { assertEx } from '@xylabs/assert'
import { AxiosJson } from '@xyo-network/axios'
import { ElevationSchema } from '@xyo-network/elevation-payload-plugin'
import { GeographicCoordinateSystemLocation, Location, LocationPayload, QuadkeyLocation } from '@xyo-network/location-payload-plugin'
import { ModuleParams } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'
import { Quadkey } from '@xyo-network/quadkey'
import { AbstractWitness, XyoWitnessConfig } from '@xyo-network/witness'
import compact from 'lodash/compact'
import merge from 'lodash/merge'

export type ElevationWitnessConfigSchema = 'network.xyo.elevation.config'
export const ElevationWitnessConfigSchema: ElevationWitnessConfigSchema = 'network.xyo.elevation.config'

interface OpenElevationResult {
  results: [
    {
      elevation: number
      latitude: number
      longitude: number
    },
  ]
}

export type ElevationWitnessConfig = XyoWitnessConfig<{
  locations?: LocationPayload[]
  schema: ElevationWitnessConfigSchema
  uri?: string
  zoom?: number
}>

const physicalLocationToOpenElevationLocation = (location: Location, zoom: number) => {
  const quadkey = assertEx(
    (location as QuadkeyLocation).quadkey
      ? Quadkey.fromBase10String((location as QuadkeyLocation).quadkey)
      : Quadkey.fromLngLat(
          { lat: (location as GeographicCoordinateSystemLocation).latitude, lng: (location as GeographicCoordinateSystemLocation).longitude },
          zoom,
        ),
  )
  const center = quadkey.center
  return { latitude: center.lat, longitude: center?.lng }
}

export class ElevationWitness extends AbstractWitness<ElevationWitnessConfig> {
  static override configSchema = ElevationWitnessConfigSchema

  public get locations() {
    return compact(
      this.config?.locations?.map((location) => {
        return physicalLocationToOpenElevationLocation(location, this.zoom)
      }),
    )
  }

  public get uri() {
    return this.config?.uri ?? 'https://api.open-elevation.com/api/v1/lookup'
  }

  public get zoom() {
    return this.config?.zoom ?? 24
  }

  static override async create(params?: ModuleParams<ElevationWitnessConfig>): Promise<ElevationWitness> {
    return (await super.create(params)) as ElevationWitness
  }

  override async observe(payloads?: LocationPayload[]): Promise<XyoPayload[]> {
    const request = {
      locations: payloads?.map((location) => physicalLocationToOpenElevationLocation(location as Location, this.zoom)) ?? this.locations,
    }
    const result = await new AxiosJson().post<OpenElevationResult>('https://api.open-elevation.com/api/v1/lookup', request)
    const results = result.data?.results
    return super.observe(results?.map((result, index) => merge({}, result, payloads?.[index], { schema: ElevationSchema })))
  }
}
