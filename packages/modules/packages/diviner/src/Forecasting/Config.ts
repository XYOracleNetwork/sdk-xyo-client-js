import { DivinerConfig } from '@xyo-network/diviner-model'
import { ModuleFilter } from '@xyo-network/module-model'

import { ForecastingDivinerSchema } from './Schema'
import { WindowSettings } from './WindowSettings'

export type ForecastingDivinerConfigSchema = `${ForecastingDivinerSchema}.config`
export const ForecastingDivinerConfigSchema: ForecastingDivinerConfigSchema = `${ForecastingDivinerSchema}.config`

export type ForecastingDivinerConfig = DivinerConfig<
  {
    archivist?: ModuleFilter
    schema: ForecastingDivinerConfigSchema
  } & WindowSettings
>
