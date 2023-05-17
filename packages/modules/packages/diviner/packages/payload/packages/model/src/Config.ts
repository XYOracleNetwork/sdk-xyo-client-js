import { DivinerConfig } from '@xyo-network/diviner-model'

import { PayloadDivinerSchema } from './Schema'

export type PayloadDivinerConfigSchema = `${PayloadDivinerSchema}.config`
export const PayloadDivinerConfigSchema: PayloadDivinerConfigSchema = `${PayloadDivinerSchema}.config`

export type PayloadDivinerConfig = DivinerConfig<{
  schema: PayloadDivinerConfigSchema
}>
