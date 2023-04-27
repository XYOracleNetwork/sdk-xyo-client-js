import { DivinerParams } from '@xyo-network/diviner-model'
import { AnyConfigSchema } from '@xyo-network/module-model'

import { AddressHistoryDivinerConfig } from './Config'

export type AddressHistoryDivinerParams = DivinerParams<AnyConfigSchema<AddressHistoryDivinerConfig>>
