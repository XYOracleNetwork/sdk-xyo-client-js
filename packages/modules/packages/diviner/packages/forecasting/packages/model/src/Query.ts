import {
  asSchema, type Payload, type Query,
} from '@xyo-network/payload-model'

import type { ForecastingSettings } from './Config/index.ts'
import { ForecastingDivinerSchema } from './Schema.ts'

export const ForecastingDivinerQuerySchema = asSchema(`${ForecastingDivinerSchema}.query`, true)
export type ForecastingDivinerQuerySchema = typeof ForecastingDivinerQuerySchema

export type ForecastingDivinerQueryPayload = Query<{ schema: ForecastingDivinerQuerySchema } & Partial<ForecastingSettings>>
export const isForecastingDivinerQueryPayload = (x?: Payload | null): x is ForecastingDivinerQueryPayload =>
  x?.schema === ForecastingDivinerQuerySchema
