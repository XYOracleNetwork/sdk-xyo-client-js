import { DivinerConfig } from '@xyo-network/diviner-model'
import { ModuleIdentifier } from '@xyo-network/module-model'

import { ForecastingDivinerSchema } from '../Schema.ts'
import { ForecastingSettings } from './ForecastingSettings.ts'
import { TransformerSettings } from './TransformerSettings.ts'

export type ForecastingDivinerConfigSchema = `${ForecastingDivinerSchema}.config`
export const ForecastingDivinerConfigSchema: ForecastingDivinerConfigSchema = `${ForecastingDivinerSchema}.config`

export type ForecastingDivinerConfig = DivinerConfig<
  {
    boundWitnessDiviner?: ModuleIdentifier
    schema: ForecastingDivinerConfigSchema
  } & ForecastingSettings &
  TransformerSettings
>
