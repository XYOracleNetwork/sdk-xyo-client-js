import { asSchema, type Payload } from '@xyo-network/payload-model'

import { ForecastingDivinerSchema } from '../Schema.ts'
import type { Forecast } from './Forecast.ts'

export const ForecastPayloadSchema = asSchema(`${ForecastingDivinerSchema}.forecast`, true)
export type ForecastPayloadSchema = typeof ForecastPayloadSchema

export type ForecastPayload = Payload<{
  schema: ForecastPayloadSchema
  sources: string[]
  values: Forecast[]
}>
export const isForecastPayload = (x?: Payload | null): x is ForecastPayload => x?.schema === ForecastPayloadSchema
