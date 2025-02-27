import type { DivinerParams } from '@xyo-network/diviner-model'
import type { AnyConfigSchema } from '@xyo-network/module-model'

import type { CoinUserLocationsDivinerConfig } from './Config.ts'

export type CoinUserLocationsDivinerParams = DivinerParams<AnyConfigSchema<CoinUserLocationsDivinerConfig>>
