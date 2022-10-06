import { assertEx } from '@xylabs/assert'
import { LngLatPhysicalLocation, PhysicalLocation, QuadkeyPhysicalLocation, XyoLocationPayload } from '@xyo-network/location-payload-plugin'
import { Quadkey } from '@xyo-network/quadkey'
import { AxiosJson } from '@xyo-network/utils'
import { XyoWitness, XyoWitnessConfig } from '@xyo-network/witness'
import compact from 'lodash/compact'
import merge from 'lodash/merge'

import { XyoLocationElevationPayload } from './Payload'
import { XyoLocationElevationSchema } from './Schema'

export type XyoLocationElevationWitnessConfigSchema = 'network.xyo.elevation.config'
export const XyoLocationElevationWitnessConfigSchema: XyoLocationElevationWitnessConfigSchema = 'network.xyo.elevation.config'

interface OpenElevationResult {
  results: [
    {
      longitude: number
      elevation: number
      latitude: number
    },
  ]
}

export type XyoLocationElevationWitnessConfig = XyoWitnessConfig<
  XyoLocationElevationPayload,
  {
    schema: XyoLocationElevationWitnessConfigSchema
    uri?: string
    zoom?: number
    locations?: XyoLocationPayload[]
  }
>

const physicalLocationToOpenElevationLocation = (location: PhysicalLocation, zoom: number) => {
  const quadkey = assertEx(
    (location as QuadkeyPhysicalLocation).quadkey
      ? Quadkey.fromBase10String((location as QuadkeyPhysicalLocation).quadkey)
      : Quadkey.fromLngLat({ lat: (location as LngLatPhysicalLocation).latitude, lng: (location as LngLatPhysicalLocation).longitude }, zoom),
  )
  const center = quadkey.toCenter()
  return { latitude: center.lat, longitude: center?.lng }
}

export class XyoLocationElevationWitness extends XyoWitness<XyoLocationElevationPayload, XyoLocationElevationWitnessConfig> {
  public get uri() {
    return this.config?.uri ?? 'https://api.open-elevation.com/api/v1/lookup'
  }

  public get zoom() {
    return this.config?.zoom ?? 24
  }

  public get locations() {
    return compact(
      this.config?.locations?.map((location) => {
        return physicalLocationToOpenElevationLocation(location, this.zoom)
      }),
    )
  }

  override async observe(fields?: Partial<XyoLocationElevationPayload>[]): Promise<XyoLocationElevationPayload[]> {
    const request = {
      locations: fields?.map((location) => physicalLocationToOpenElevationLocation(location as PhysicalLocation, this.zoom)) ?? this.locations,
    }
    console.log(`Elevation request: ${JSON.stringify(request, null, 2)}`)
    const result = await new AxiosJson().post<OpenElevationResult>('https://api.open-elevation.com/api/v1/lookup', request)
    const results = result.data?.results
    console.log(`Elevation result.status: ${JSON.stringify(result.status, null, 2)}`)
    console.log(`Elevation observe: ${JSON.stringify(results, null, 2)}`)
    return super.observe(results?.map((result, index) => merge({}, result, fields?.[index])))
  }

  static schema: XyoLocationElevationSchema = XyoLocationElevationSchema
}
