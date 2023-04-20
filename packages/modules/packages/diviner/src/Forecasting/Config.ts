import { DivinerConfig } from '@xyo-network/diviner-model'

import { ForecastingDivinerSchema } from './Schema'
import { WindowSettings } from './WindowSettings'

export type ForecastingDivinerConfigSchema = `${ForecastingDivinerSchema}.config`
export const ForecastingDivinerConfigSchema: ForecastingDivinerConfigSchema = `${ForecastingDivinerSchema}.config`

export type ForecastingDivinerConfig = DivinerConfig<
  {
    schema: ForecastingDivinerConfigSchema
  } & WindowSettings
>
