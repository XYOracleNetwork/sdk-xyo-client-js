import { assertEx } from '@xylabs/assert'
import { AxiosJson } from '@xyo-network/axios'
import { GeographicCoordinateSystemLocation, GeographicCoordinateSystemLocationPayload } from '@xyo-network/location-payload-plugin'
import { XyoModuleParams } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'
import { Quadkey } from '@xyo-network/quadkey'
import { AbstractWitness, XyoWitnessConfig } from '@xyo-network/witness'
import compact from 'lodash/compact'
import merge from 'lodash/merge'

import { XyoLocationElevationSchema } from './Schema'

export type XyoLocationElevationWitnessConfigSchema = 'network.xyo.elevation.config'
export const XyoLocationElevationWitnessConfigSchema: XyoLocationElevationWitnessConfigSchema = 'network.xyo.elevation.config'

interface OpenElevationResult {
  results: [
    {
      elevation: number
      latitude: number
      longitude: number
    },
  ]
}

export type XyoLocationElevationWitnessConfig = XyoWitnessConfig<{
  locations?: GeographicCoordinateSystemLocationPayload[]
  schema: XyoLocationElevationWitnessConfigSchema
  uri?: string
  zoom?: number
}>

const physicalLocationToOpenElevationLocation = (location: GeographicCoordinateSystemLocation, zoom: number) => {
  const quadkey = assertEx(Quadkey.fromLngLat({ lat: location.latitude, lng: location.longitude }, zoom))
  const center = quadkey.center
  return { latitude: center.lat, longitude: center?.lng }
}

export class XyoLocationElevationWitness extends AbstractWitness<XyoLocationElevationWitnessConfig> {
  static override configSchema = XyoLocationElevationWitnessConfigSchema

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

  static override async create(params?: XyoModuleParams<XyoLocationElevationWitnessConfig>): Promise<XyoLocationElevationWitness> {
    return (await super.create(params)) as XyoLocationElevationWitness
  }

  override async observe(payloads?: XyoPayload[]): Promise<XyoPayload[]> {
    const request = {
      locations:
        payloads?.map((location) => physicalLocationToOpenElevationLocation(location as GeographicCoordinateSystemLocationPayload, this.zoom)) ??
        this.locations,
    }
    const result = await new AxiosJson().post<OpenElevationResult>('https://api.open-elevation.com/api/v1/lookup', request)
    const results = result.data?.results
    const resultPayloads = results?.map((result, index) => merge({}, result, payloads?.[index], { schema: XyoLocationElevationSchema }))
    return super.observe(resultPayloads)
  }
}
