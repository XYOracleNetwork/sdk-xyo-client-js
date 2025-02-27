import { DivinerParams } from '@xyo-network/diviner-model'
import { AnyConfigSchema } from '@xyo-network/module-model'

import { AddressChainDivinerConfig } from './Config.ts'

export type AddressChainDivinerParams = DivinerParams<AnyConfigSchema<AddressChainDivinerConfig>>
