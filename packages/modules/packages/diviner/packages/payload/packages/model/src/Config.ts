import { DivinerConfig } from '@xyo-network/diviner-model'
import { ModuleFilter } from '@xyo-network/module-model'

import { PayloadDivinerSchema } from './Schema'

export type PayloadDivinerConfigSchema = `${PayloadDivinerSchema}.config`
export const PayloadDivinerConfigSchema: PayloadDivinerConfigSchema = `${PayloadDivinerSchema}.config`

export type PayloadDivinerConfig = DivinerConfig<{
  archivist?: ModuleFilter
  schema: PayloadDivinerConfigSchema
}>
