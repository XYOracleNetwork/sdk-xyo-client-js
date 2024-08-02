import { DivinerParams } from '@xyo-network/diviner-model'
import { AnyConfigSchema } from '@xyo-network/module-model'

import { CoinUserLocationsDivinerConfig } from './Config.ts'

export type CoinUserLocationsDivinerParams = DivinerParams<AnyConfigSchema<CoinUserLocationsDivinerConfig>>
