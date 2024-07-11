import { DivinerParams } from '@xyo-network/diviner-model'
import { AnyConfigSchema } from '@xyo-network/module-model'

import { AddressChainDivinerConfig } from './Config.js'

export type AddressChainDivinerParams = DivinerParams<AnyConfigSchema<AddressChainDivinerConfig>>
