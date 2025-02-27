import type { DivinerParams } from '@xyo-network/diviner-model'
import type { AnyConfigSchema } from '@xyo-network/module-model'

import type { AddressChainDivinerConfig } from './Config.ts'

export type AddressChainDivinerParams = DivinerParams<AnyConfigSchema<AddressChainDivinerConfig>>
