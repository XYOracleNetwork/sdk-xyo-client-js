import { DivinerParams } from '@xyo-network/diviner-model'
import { AnyConfigSchema } from '@xyo-network/module-model'

import { AddressSpaceDivinerConfig } from './Config.js'

export type AddressSpaceDivinerParams = DivinerParams<AnyConfigSchema<AddressSpaceDivinerConfig>>
