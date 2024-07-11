import { Payload } from '@xyo-network/payload-model'

import { ForecastingDivinerSchema } from '../Schema.js'
import { Forecast } from './Forecast.js'

export type ForecastPayloadSchema = `${ForecastingDivinerSchema}.forecast`
export const ForecastPayloadSchema: ForecastPayloadSchema = `${ForecastingDivinerSchema}.forecast`

export type ForecastPayload = Payload<{
  schema: ForecastPayloadSchema
  sources: string[]
  values: Forecast[]
}>
export const isForecastPayload = (x?: Payload | null): x is ForecastPayload => x?.schema === ForecastPayloadSchema
