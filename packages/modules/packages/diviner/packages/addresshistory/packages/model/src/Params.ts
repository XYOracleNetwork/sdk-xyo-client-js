import { DivinerParams } from '@xyo-network/diviner-model'
import { AnyConfigSchema } from '@xyo-network/module-model'

import { AddressHistoryDivinerConfig } from './Config.ts'

export type AddressHistoryDivinerParams = DivinerParams<AnyConfigSchema<AddressHistoryDivinerConfig>>
