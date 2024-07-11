import { DivinerConfig } from '@xyo-network/diviner-model'

import { CoinUserLocationsDivinerConfigSchema } from './Schema.js'

export type CoinUserLocationsDivinerConfig = DivinerConfig<{
  address?: string
  schema: CoinUserLocationsDivinerConfigSchema
}>
