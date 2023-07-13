import { Payload, Query } from '@xyo-network/payload-model'

import { ForecastingSettings } from './Config'
import { ForecastingDivinerSchema } from './Schema'

export type ForecastingDivinerQuerySchema = `${ForecastingDivinerSchema}.query`
export const ForecastingDivinerQuerySchema: ForecastingDivinerQuerySchema = `${ForecastingDivinerSchema}.query`

export type ForecastingDivinerQueryPayload = Query<{ schema: ForecastingDivinerQuerySchema } & Partial<ForecastingSettings>>
export const isForecastingDivinerQueryPayload = (x?: Payload | null): x is ForecastingDivinerQueryPayload =>
  x?.schema === ForecastingDivinerQuerySchema
