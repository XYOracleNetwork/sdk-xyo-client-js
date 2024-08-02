import { DivinerConfig } from '@xyo-network/diviner-model'

import { CoinUserLocationsDivinerConfigSchema } from './Schema.ts'

export type CoinUserLocationsDivinerConfig = DivinerConfig<{
  address?: string
  schema: CoinUserLocationsDivinerConfigSchema
}>
