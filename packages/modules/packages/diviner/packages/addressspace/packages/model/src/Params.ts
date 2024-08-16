import type { DivinerParams } from '@xyo-network/diviner-model'
import type { AnyConfigSchema } from '@xyo-network/module-model'

import type { AddressSpaceDivinerConfig } from './Config.ts'

export type AddressSpaceDivinerParams = DivinerParams<AnyConfigSchema<AddressSpaceDivinerConfig>>
