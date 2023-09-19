import { Payload } from '@xyo-network/payload-model'

import { TransformDivinerSchema } from '../Schema'
import { Forecast } from './Forecast'

export type ForecastPayloadSchema = `${TransformDivinerSchema}.forecast`
export const ForecastPayloadSchema: ForecastPayloadSchema = `${TransformDivinerSchema}.forecast`

export type ForecastPayload = Payload<{
  schema: ForecastPayloadSchema
  values: Forecast[]
}>
export const isForecastPayload = (x?: Payload | null): x is ForecastPayload => x?.schema === ForecastPayloadSchema
