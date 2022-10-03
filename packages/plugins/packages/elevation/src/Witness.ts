import { AxiosJson } from '@xyo-network/utils'
import { XyoWitness, XyoWitnessConfig } from '@xyo-network/witness'

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
  }
>

export class XyoLocationElevationWitness extends XyoWitness<XyoLocationElevationPayload, XyoLocationElevationWitnessConfig> {
  public get uri() {
    return this.config?.uri ?? 'https://api.open-elevation.com/api/v1/lookup'
  }

  override async observe(
    fields: Partial<XyoLocationElevationPayload> & { longitude: number; latitude: number },
  ): Promise<XyoLocationElevationPayload> {
    const result = await new AxiosJson().post<OpenElevationResult>('https://api.open-elevation.com/api/v1/lookup', {
      locations: [{ latitude: fields.latitude, longitude: fields.longitude }],
    })
    return super.observe(result.data.results[0])
  }

  static schema: XyoLocationElevationSchema = XyoLocationElevationSchema
}
