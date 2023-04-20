import { Query } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { ForecastingDivinerSchema } from './Schema'
import { WindowSettings } from './WindowSettings'

export type ForecastingDivinerQuerySchema = `${ForecastingDivinerSchema}.query`
export const ForecastingDivinerQuerySchema: ForecastingDivinerQuerySchema = `${ForecastingDivinerSchema}.query`

export type ForecastingDivinerQueryPayload = Query<{ schema: ForecastingDivinerQuerySchema } & Partial<WindowSettings>>
export const isForecastingDivinerQueryPayload = (x?: Payload | null): x is ForecastingDivinerQueryPayload =>
  x?.schema === ForecastingDivinerQuerySchema
