import { DivinerParams } from '@xyo-network/diviner-model'
import { AnyConfigSchema } from '@xyo-network/module-model'

import { CoinUserLocationsDivinerConfig } from './Config'

export type CoinUserLocationsDivinerParams = DivinerParams<AnyConfigSchema<CoinUserLocationsDivinerConfig>>
