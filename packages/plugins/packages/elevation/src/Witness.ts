import { AxiosJson } from '@xyo-network/utils'
import { XyoWitness, XyoWitnessConfig } from '@xyo-network/witness'

import { XyoElevationPayload } from './Payload'
import { XyoElevationSchema } from './Schema'

export type XyoElevationWitnessConfigSchema = 'network.xyo.elevation.config'
export const XyoElevationWitnessConfigSchema: XyoElevationWitnessConfigSchema = 'network.xyo.elevation.config'

interface OpenElevationResult {
  results: [
    {
      longitude: number
      elevation: number
      latitude: number
    },
  ]
}

export type XyoElevationWitnessConfig = XyoWitnessConfig<
  XyoElevationPayload,
  {
    schema: XyoElevationWitnessConfigSchema
    uri: string
  }
>

export class XyoElevationWitness extends XyoWitness<XyoElevationPayload, XyoElevationWitnessConfig> {
  public get uri() {
    return this.config?.uri ?? 'https://api.open-elevation.com/api/v1/lookup'
  }

  override async observe(fields: Partial<XyoElevationPayload> & { longitude: number; latitude: number }): Promise<XyoElevationPayload> {
    const result = await new AxiosJson().post<OpenElevationResult>('https://api.open-elevation.com/api/v1/lookup', {
      locations: [{ latitude: fields.latitude, longitude: fields.longitude }],
    })
    return super.observe(result.data.results[0])
  }

  static schema: XyoElevationSchema = XyoElevationSchema
}
