import { DivinerParams } from '@xyo-network/diviner-model'
import { AnyConfigSchema } from '@xyo-network/module-model'

import { AddressChainDivinerConfig } from './Config'

export type AddressChainDivinerParams = DivinerParams<AnyConfigSchema<AddressChainDivinerConfig>>
