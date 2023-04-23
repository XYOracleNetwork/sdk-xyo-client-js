import { DivinerConfig } from '@xyo-network/diviner-model'
import { ModuleFilter } from '@xyo-network/module-model'

import { ForecastingSettings } from './ForecastingSettings'
import { ForecastingDivinerSchema } from './Schema'

export type ForecastingDivinerConfigSchema = `${ForecastingDivinerSchema}.config`
export const ForecastingDivinerConfigSchema: ForecastingDivinerConfigSchema = `${ForecastingDivinerSchema}.config`

export type ForecastingDivinerConfig = DivinerConfig<
  {
    archivist?: ModuleFilter
    boundWitnessDiviner?: ModuleFilter
    schema: ForecastingDivinerConfigSchema
  } & ForecastingSettings
>
