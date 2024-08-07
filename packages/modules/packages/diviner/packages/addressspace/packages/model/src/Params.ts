import { DivinerParams } from '@xyo-network/diviner-model'
import { AnyConfigSchema } from '@xyo-network/module-model'

import { AddressSpaceDivinerConfig } from './Config.ts'

export type AddressSpaceDivinerParams = DivinerParams<AnyConfigSchema<AddressSpaceDivinerConfig>>
