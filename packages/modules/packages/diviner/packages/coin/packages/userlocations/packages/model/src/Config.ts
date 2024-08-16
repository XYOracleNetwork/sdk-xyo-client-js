import type { DivinerConfig } from '@xyo-network/diviner-model'

import type { CoinUserLocationsDivinerConfigSchema } from './Schema.ts'

export type CoinUserLocationsDivinerConfig = DivinerConfig<{
  address?: string
  schema: CoinUserLocationsDivinerConfigSchema
}>
