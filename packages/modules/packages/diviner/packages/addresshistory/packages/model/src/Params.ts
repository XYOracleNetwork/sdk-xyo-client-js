import type { DivinerParams } from '@xyo-network/diviner-model'
import type { AnyConfigSchema } from '@xyo-network/module-model'

import type { AddressHistoryDivinerConfig } from './Config.ts'

export type AddressHistoryDivinerParams = DivinerParams<AnyConfigSchema<AddressHistoryDivinerConfig>>
