import type { DivinerConfig } from '@xyo-network/diviner-model'
import type { ModuleIdentifier } from '@xyo-network/module-model'
import { asSchema } from '@xyo-network/payload-model'

import { ForecastingDivinerSchema } from '../Schema.ts'
import type { ForecastingSettings } from './ForecastingSettings.ts'
import type { TransformerSettings } from './TransformerSettings.ts'

export const ForecastingDivinerConfigSchema = asSchema(`${ForecastingDivinerSchema}.config`, true)
export type ForecastingDivinerConfigSchema = typeof ForecastingDivinerConfigSchema

export type ForecastingDivinerConfig = DivinerConfig<
  {
    boundWitnessDiviner?: ModuleIdentifier
    schema: ForecastingDivinerConfigSchema
  } & ForecastingSettings
  & TransformerSettings
>
