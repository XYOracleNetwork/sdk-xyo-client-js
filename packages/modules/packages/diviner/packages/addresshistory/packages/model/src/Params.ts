import { DivinerParams } from '@xyo-network/diviner-model'
import { AnyConfigSchema } from '@xyo-network/module-model'

import { AddressHistoryDivinerConfig } from './Config.js'

export type AddressHistoryDivinerParams = DivinerParams<AnyConfigSchema<AddressHistoryDivinerConfig>>
