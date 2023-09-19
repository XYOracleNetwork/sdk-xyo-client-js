import { DivinerConfig } from '@xyo-network/diviner-model'
import { ModuleFilter } from '@xyo-network/module-model'

import { TransformDivinerSchema } from '../Schema'
import { TransformerSettings } from './TransformerSettings'
import { TransformSettings } from './TransformSettings'

export type TransformDivinerConfigSchema = `${TransformDivinerSchema}.config`
export const TransformDivinerConfigSchema: TransformDivinerConfigSchema = `${TransformDivinerSchema}.config`

export type TransformDivinerConfig = DivinerConfig<
  {
    boundWitnessDiviner?: ModuleFilter
    schema: TransformDivinerConfigSchema
  } & TransformSettings &
    TransformerSettings
>
